"use client";

interface Task {
  id: string;
  title: string;
  deps: string[];
  acceptanceCriteria: string[];
  files: string[];
  status: string;
}

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  pending: { color: "bg-muted text-muted-foreground", label: "Pending", icon: "⏳" },
  running: { color: "bg-primary/20 text-primary", label: "Running", icon: "🔄" },
  passed: { color: "bg-green-900/30 text-green-400", label: "Passed", icon: "✅" },
  failed: { color: "bg-red-900/30 text-red-400", label: "Failed", icon: "❌" },
};

export function TaskCard({ task }: { task: Task }) {
  const config = statusConfig[task.status] ?? statusConfig.pending;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{task.title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {task.id}
            {task.deps.length > 0 && ` → depends on ${task.deps.join(", ")}`}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
        >
          {config.icon} {config.label}
        </span>
      </div>

      {task.acceptanceCriteria.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground">Criteria:</p>
          <ul className="mt-1 space-y-0.5">
            {task.acceptanceCriteria.map((criterion, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                • {criterion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {task.files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.files.map((file) => (
            <span
              key={file}
              className="rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] font-mono text-secondary-foreground"
            >
              {file}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
