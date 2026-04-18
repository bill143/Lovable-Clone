export function CloneEngine() {
  return (
    <section id="clone-engine" className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              NEXUS Exclusive
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Clone Intelligence Engine
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Paste any URL and NEXUS reverse-engineers the entire site — DOM structure,
              design tokens, API schemas, component boundaries, and user flows. Get a
              fully annotated Next.js clone in minutes.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "DOM & computed CSS extraction with design token inference",
                "Network traffic analysis — XHR, fetch, WebSocket, GraphQL",
                "Framework & state management detection",
                "Playwright-driven user flow mapping",
                "Asset extraction and optimization",
                "Site Intelligence Report (Markdown + Mermaid diagrams)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 text-primary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Clone engine visualization */}
          <div className="overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="border-b border-border px-4 py-3">
              <span className="text-xs text-muted-foreground">Clone Intelligence Engine</span>
            </div>
            <div className="space-y-4 p-6 font-mono text-sm">
              <div>
                <span className="text-muted-foreground">Input URL:</span>
                <span className="ml-2 text-primary">https://example.com</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-green-400">DOM extracted</span>
                  <span className="text-muted-foreground">— 847 nodes, 23 components</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-green-400">Styles captured</span>
                  <span className="text-muted-foreground">— 156 design tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-green-400">APIs detected</span>
                  <span className="text-muted-foreground">— 12 endpoints, OpenAPI generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-green-400">Framework</span>
                  <span className="text-muted-foreground">— React 18 + Next.js + Zustand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-blue-400">Generating clone...</span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <span className="text-muted-foreground">Output:</span>
                <span className="ml-2 text-foreground">23 components · 12 API routes · 1 report</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
