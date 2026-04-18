export function AutonomousAgent() {
  return (
    <section id="agent" className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Agent visualization */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="border-b border-border px-4 py-3">
                <span className="text-xs text-muted-foreground">Autonomous Self-Improving Agent</span>
              </div>
              <div className="space-y-3 p-6 text-sm">
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="mb-1 text-xs font-medium text-blue-400">👁️ SEES</div>
                  <p className="text-muted-foreground">
                    Screenshots output, diffs vs target using GPT-4o vision
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="mb-1 text-xs font-medium text-purple-400">🧠 REASONS</div>
                  <p className="text-muted-foreground">
                    LangGraph multi-agent: Planner → Coder → Critic → Tester → Reflector
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="mb-1 text-xs font-medium text-green-400">🗣️ TALKS</div>
                  <p className="text-muted-foreground">
                    Whisper STT + ElevenLabs TTS — push-to-talk & ambient mode
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="mb-1 text-xs font-medium text-yellow-400">📚 LEARNS</div>
                  <p className="text-muted-foreground">
                    pgvector memory: task → approach → outcome → lessons
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/50 p-3">
                  <div className="mb-1 text-xs font-medium text-red-400">🔬 SELF-TESTS</div>
                  <p className="text-muted-foreground">
                    Runs code in E2B sandbox, reads stderr, auto-patches
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              NEXUS Exclusive
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Autonomous Self-Improving Agent
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              NEXUS doesn&apos;t just generate code — it sees, reasons, speaks, learns,
              and improves. A truly autonomous AI agent that gets smarter with every build.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Visual diff comparison against target designs",
                "Multi-step reasoning with LangGraph orchestration",
                "Voice interaction with push-to-talk and ambient mode",
                "Persistent memory with pgvector for learning from past builds",
                "Sandboxed code execution with automatic error recovery",
                "Post-build retrospective to long-term memory",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 text-primary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
