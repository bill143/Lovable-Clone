import Link from "next/link";
import { getProjects } from "@/app/actions/projects";
import { CreateProjectForm } from "@/components/agent/CreateProjectForm";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              N
            </div>
            <span className="text-lg font-bold tracking-tight">NEXUS</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="mt-1 text-muted-foreground">
              Build apps with the NEXUS AI agent.
            </p>
          </div>
        </div>

        <CreateProjectForm />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">
                No projects yet. Create one above to get started.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}/agent`}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-card/80"
              >
                <h3 className="font-semibold group-hover:text-primary">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {project.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
