export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
          Now in development — PR #1 Foundation
        </div>

        <h1 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl lg:text-7xl">
          Build anything with
          <br />
          <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI intelligence
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          NEXUS is an elite AI-powered app builder with a Clone Intelligence Engine.
          Describe what you want, paste a URL to clone, or upload a screenshot —
          and watch your app come to life.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
          >
            Start Building — Free
          </a>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            See Features
          </a>
        </div>

        {/* Mock terminal */}
        <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-xs text-muted-foreground">nexus-terminal</span>
          </div>
          <div className="p-6 text-left font-mono text-sm">
            <p className="text-muted-foreground">
              <span className="text-primary">$</span> nexus build &quot;A project management dashboard
              with Kanban boards, team chat, and analytics&quot;
            </p>
            <p className="mt-3 text-green-400">
              ✓ Planning architecture...
            </p>
            <p className="text-green-400">
              ✓ Generating 14 components...
            </p>
            <p className="text-green-400">
              ✓ Wiring Supabase database...
            </p>
            <p className="text-green-400">
              ✓ Running tests (12/12 passed)...
            </p>
            <p className="text-green-400">
              ✓ Deploying to Vercel...
            </p>
            <p className="mt-3 text-foreground">
              🚀 Live at{" "}
              <span className="text-primary underline">https://my-app.vercel.app</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
