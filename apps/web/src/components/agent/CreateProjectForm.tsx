"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/projects";

export function CreateProjectForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProject(formData);

    if ("error" in result) {
      setError(result.error);
      setIsPending(false);
    } else {
      setIsOpen(false);
      setIsPending(false);
      router.push(`/projects/${result.id}/agent`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        + New Project
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5"
    >
      <h3 className="mb-3 font-semibold">Create Project</h3>

      {error && (
        <div className="mb-3 rounded-lg bg-red-900/20 p-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="My awesome app"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="What does this project do?"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
