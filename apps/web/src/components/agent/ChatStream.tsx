"use client";

import { useRef, useEffect, useState } from "react";

interface AgentEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
}

function eventTypeLabel(type: string): string {
  switch (type) {
    case "plan":
      return "📋 Plan";
    case "task_start":
      return "🚀 Task Start";
    case "task_patch":
      return "📝 Patch";
    case "task_critique":
      return "🔍 Critique";
    case "task_test":
      return "🧪 Test";
    case "task_reflect":
      return "💭 Reflect";
    case "task_done":
      return "✅ Done";
    case "error":
      return "❌ Error";
    case "done":
      return "🎉 Complete";
    default:
      return type;
  }
}

function eventColor(type: string): string {
  switch (type) {
    case "error":
      return "text-red-400";
    case "done":
      return "text-green-400";
    case "task_done":
      return "text-green-300";
    case "plan":
      return "text-blue-400";
    default:
      return "text-muted-foreground";
  }
}

export function ChatStream({
  events,
  isRunning,
  onSubmit,
}: {
  events: AgentEvent[];
  isRunning: boolean;
  onSubmit: (goal: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;
    onSubmit(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Events list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 && !isRunning && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold">NEXUS Agent</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Describe what you want to build and the agent will create a plan
                and generate code.
              </p>
            </div>
          </div>
        )}

        {events.map((event, i) => (
          <div key={i} className="rounded-lg bg-card/50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className={`font-medium ${eventColor(event.type)}`}>
                {eventTypeLabel(event.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {formatEventData(event)}
            </div>
          </div>
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Processing…
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border/50 p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build…"
            disabled={isRunning}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isRunning || !input.trim()}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isRunning ? "Running…" : "Run"}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatEventData(event: AgentEvent): string {
  const data = event.data;
  switch (event.type) {
    case "plan":
      if (data.status === "running") return "Generating plan…";
      if (data.plan) return `Plan ready with ${((data.plan as Record<string, unknown>).tasks as unknown[])?.length ?? 0} tasks`;
      return JSON.stringify(data);
    case "task_start":
      return `Starting: ${data.title ?? data.taskId}`;
    case "task_patch":
      return `Generated patches for task ${data.taskId}`;
    case "task_critique": {
      const critique = data.critique as Record<string, unknown> | undefined;
      if (critique) {
        return critique.pass
          ? "✓ Code review passed"
          : `✗ Issues: ${(critique.issues as string[])?.join(", ")}`;
      }
      return JSON.stringify(data);
    }
    case "task_test": {
      const test = data.testResult as Record<string, unknown> | undefined;
      return test?.pass ? "✓ Tests passed (dry-run)" : "✗ Tests failed";
    }
    case "task_reflect":
      return "Reflection recorded to memory";
    case "task_done":
      return `Task complete, moving to next`;
    case "error":
      return String(data.message ?? JSON.stringify(data));
    case "done":
      return `Agent finished — ${data.totalTasks ?? data.events} events processed`;
    default:
      return JSON.stringify(data);
  }
}
