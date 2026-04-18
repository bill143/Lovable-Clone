import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
import { plannerAgent } from "../agents/planner";
import { coderAgent } from "../agents/coder";
import { criticAgent } from "../agents/critic";
import { testerAgent } from "../agents/tester";
import { reflectorAgent } from "../agents/reflector";
import type {
  Plan,
  PatchSet,
  CritiqueResult,
  TestResult,
  MemoryRecord,
  StreamEvent,
  AgentState,
} from "../state/types";

type OnEvent = (event: StreamEvent) => void;

function emitEvent(onEvent: OnEvent | undefined, type: StreamEvent["type"], data: unknown): void {
  if (onEvent) {
    onEvent({ type, data, timestamp: Date.now() });
  }
}

// Define the graph state annotation
const GraphAnnotation = Annotation.Root({
  goal: Annotation<string>,
  projectId: Annotation<string>,
  plan: Annotation<Plan | undefined>,
  currentTaskIndex: Annotation<number>,
  patches: Annotation<PatchSet[]>,
  critique: Annotation<CritiqueResult | undefined>,
  testResult: Annotation<TestResult | undefined>,
  memoryRecord: Annotation<MemoryRecord | undefined>,
  retryCount: Annotation<number>,
  maxRetries: Annotation<number>,
  status: Annotation<AgentState["status"]>,
  error: Annotation<string | undefined>,
});

type GraphState = typeof GraphAnnotation.State;

/**
 * Build the LangGraph state graph wiring:
 * Planner → Coder → Critic → (loop if fail) → Tester → Reflector
 */
export function buildAgentGraph(onEvent?: OnEvent) {
  const graph = new StateGraph(GraphAnnotation);

  // ─── Planner Node ───────────────────────────────────────────────────
  graph.addNode("planner", async (state: GraphState) => {
    emitEvent(onEvent, "plan", { status: "running" });
    try {
      const plan = await plannerAgent({ goal: state.goal });
      emitEvent(onEvent, "plan", { status: "complete", plan });
      return { plan, status: "coding" as const, currentTaskIndex: 0 };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      emitEvent(onEvent, "error", { message: msg });
      return { status: "error" as const, error: msg };
    }
  });

  // ─── Coder Node ─────────────────────────────────────────────────────
  graph.addNode("coder", async (state: GraphState) => {
    const task = state.plan?.tasks[state.currentTaskIndex];
    if (!task) {
      return { status: "error" as const, error: "No task found at current index" };
    }
    emitEvent(onEvent, "task_start", { taskId: task.id, title: task.title });
    try {
      const patchSet = await coderAgent({ task });
      const patches = [...state.patches, patchSet];
      emitEvent(onEvent, "task_patch", { taskId: task.id, patches: patchSet });
      return { patches, status: "critiquing" as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      emitEvent(onEvent, "error", { taskId: task.id, message: msg });
      return { status: "error" as const, error: msg };
    }
  });

  // ─── Critic Node ────────────────────────────────────────────────────
  graph.addNode("critic", async (state: GraphState) => {
    const task = state.plan?.tasks[state.currentTaskIndex];
    const latestPatches = state.patches[state.patches.length - 1];
    if (!task || !latestPatches) {
      return { status: "error" as const, error: "Missing task or patches for critique" };
    }
    try {
      const critique = await criticAgent({ task, patches: latestPatches });
      emitEvent(onEvent, "task_critique", { taskId: task.id, critique });
      if (critique.pass) {
        return { critique, status: "testing" as const, retryCount: 0 };
      }
      return { critique, retryCount: state.retryCount + 1 };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      emitEvent(onEvent, "error", { taskId: task.id, message: msg });
      return { status: "error" as const, error: msg };
    }
  });

  // ─── Tester Node ────────────────────────────────────────────────────
  graph.addNode("tester", async (state: GraphState) => {
    const task = state.plan?.tasks[state.currentTaskIndex];
    const latestPatches = state.patches[state.patches.length - 1];
    if (!task || !latestPatches) {
      return { status: "error" as const, error: "Missing task or patches for testing" };
    }
    try {
      const testResult = await testerAgent({ patches: latestPatches });
      emitEvent(onEvent, "task_test", { taskId: task.id, testResult });
      return { testResult, status: "reflecting" as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      emitEvent(onEvent, "error", { taskId: task.id, message: msg });
      return { status: "error" as const, error: msg };
    }
  });

  // ─── Reflector Node ─────────────────────────────────────────────────
  graph.addNode("reflector", async (state: GraphState) => {
    const task = state.plan?.tasks[state.currentTaskIndex];
    if (!task) {
      return { status: "error" as const, error: "No task for reflection" };
    }
    try {
      const memoryRecord = await reflectorAgent({
        task,
        critique: state.critique,
        success: state.critique?.pass ?? false,
      });
      emitEvent(onEvent, "task_reflect", { taskId: task.id, memoryRecord });

      // Move to next task or finish
      const nextIndex = state.currentTaskIndex + 1;
      const totalTasks = state.plan?.tasks.length ?? 0;
      if (nextIndex >= totalTasks) {
        emitEvent(onEvent, "done", { totalTasks });
        return { memoryRecord, status: "done" as const, currentTaskIndex: nextIndex };
      }
      emitEvent(onEvent, "task_done", { taskId: task.id, nextIndex });
      return { memoryRecord, status: "coding" as const, currentTaskIndex: nextIndex, retryCount: 0 };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      emitEvent(onEvent, "error", { taskId: task.id, message: msg });
      return { status: "error" as const, error: msg };
    }
  });

  // ─── Edges ──────────────────────────────────────────────────────────
  // Type assertions needed because LangGraph's TS generics accumulate
  // node names incrementally and edge methods are strict about which
  // node names have been registered.
  const g = graph as unknown as {
    addEdge(a: string, b: string): void;
    addConditionalEdges(source: string, fn: (state: GraphState) => string): void;
    compile(): ReturnType<typeof graph.compile>;
  };

  g.addEdge(START, "planner");
  g.addEdge("planner", "coder");
  g.addEdge("tester", "reflector");

  // Critic → loop back to coder if fail (up to maxRetries), else → tester
  g.addConditionalEdges("critic", (state: GraphState) => {
    if (state.status === "error") return END;
    if (state.critique?.pass) return "tester";
    if (state.retryCount >= state.maxRetries) return "tester"; // give up after max retries
    return "coder"; // loop back
  });

  // Coder always goes to critic
  g.addEdge("coder", "critic");

  // Reflector → coder (next task) or END
  g.addConditionalEdges("reflector", (state: GraphState) => {
    if (state.status === "done" || state.status === "error") return END;
    return "coder"; // next task
  });

  return g.compile();
}
