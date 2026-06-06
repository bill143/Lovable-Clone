"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChatStream } from "@/components/agent/ChatStream";
import { PlanPanel } from "@/components/agent/PlanPanel";
import { MemoryInspector } from "@/components/agent/MemoryInspector";

interface AgentEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

interface Plan {
  goal: string;
  tasks: Array<{
    id: string;
    title: string;
    deps: string[];
    acceptanceCriteria: string[];
    files: string[];
    status: string;
  }>;
}

export default function AgentPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [memories, setMemories] = useState<Array<{ task: string; approach: string; outcome: string; lessons: string }>>([]);

  const handleSubmit = useCallback(
    async (goal: string) => {
      setIsRunning(true);
      setEvents([]);
      setPlan(null);
      setMemories([]);

      try {
        const response = await fetch("/api/agent/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal, projectId }),
        });

        if (!response.ok || !response.body) {
          setEvents((prev) => [
            ...prev,
            {
              type: "error",
              data: { message: "Failed to start agent run" },
              timestamp: Date.now(),
            },
          ]);
          setIsRunning(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6)) as AgentEvent;
                setEvents((prev) => [...prev, event]);

                // Update plan when we receive plan data
                if (
                  event.type === "plan" &&
                  (event.data as Record<string, unknown>).plan
                ) {
                  setPlan((event.data as Record<string, unknown>).plan as Plan);
                }

                // Update task status
                if (event.type === "task_start" && plan) {
                  setPlan((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      tasks: prev.tasks.map((t) =>
                        t.id === (event.data as Record<string, unknown>).taskId
                          ? { ...t, status: "running" }
                          : t
                      ),
                    };
                  });
                }

                if (event.type === "task_done") {
                  setPlan((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      tasks: prev.tasks.map((t) =>
                        t.id === (event.data as Record<string, unknown>).taskId
                          ? { ...t, status: "passed" }
                          : t
                      ),
                    };
                  });
                }

                // Collect memory records
                if (event.type === "task_reflect" && event.data) {
                  const record = (event.data as Record<string, unknown>).memoryRecord;
                  if (record) {
                    setMemories((prev) => [
                      ...prev,
                      record as { task: string; approach: string; outcome: string; lessons: string },
                    ]);
                  }
                }
              } catch {
                // Skip malformed events
              }
            }
          }
        }
      } catch (error) {
        setEvents((prev) => [
          ...prev,
          {
            type: "error",
            data: {
              message:
                error instanceof Error ? error.message : "Connection failed",
            },
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsRunning(false);
      }
    },
    [projectId]
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              N
            </div>
            <span className="text-sm font-semibold">NEXUS</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">
            Project {projectId.slice(0, 8)}…
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Agent running…
            </span>
          )}
        </div>
      </header>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat Stream */}
        <div className="flex w-1/2 flex-col border-r border-border/50">
          <ChatStream
            events={events}
            isRunning={isRunning}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right: Plan Panel + Memory */}
        <div className="flex w-1/2 flex-col overflow-y-auto">
          <PlanPanel plan={plan} />
          {memories.length > 0 && <MemoryInspector memories={memories} />}
        </div>
      </div>
    </div>
  );
}
