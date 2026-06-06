"use client";

interface Memory {
  task: string;
  approach: string;
  outcome: string;
  lessons: string;
}

export function MemoryInspector({ memories }: { memories: Memory[] }) {
  if (memories.length === 0) return null;

  return (
    <div className="border-t border-border/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
        🧠 Memory Inspector ({memories.length} records)
      </h3>
      <div className="space-y-3">
        {memories.map((memory, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card/30 p-3 text-xs"
          >
            <div className="space-y-1.5">
              <div>
                <span className="font-medium text-foreground">Task: </span>
                <span className="text-muted-foreground">{memory.task}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Approach: </span>
                <span className="text-muted-foreground">{memory.approach}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Outcome: </span>
                <span className="text-muted-foreground">{memory.outcome}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Lessons: </span>
                <span className="text-muted-foreground">{memory.lessons}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
