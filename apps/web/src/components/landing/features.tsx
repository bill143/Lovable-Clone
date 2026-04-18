const features = [
  {
    icon: "💬",
    title: "Chat-to-App Builder",
    description:
      "Describe your app in plain English. NEXUS plans, codes, tests, and deploys — all from a conversation.",
  },
  {
    icon: "⚡",
    title: "Live WebContainer Preview",
    description:
      "See your app running in real-time with hot reload. Edit code and watch changes instantly in the browser.",
  },
  {
    icon: "🎨",
    title: "Visual Design Mode",
    description:
      "Point-and-click editing with design tokens. Adjust spacing, colors, and typography visually.",
  },
  {
    icon: "🔗",
    title: "GitHub Sync & Deploy",
    description:
      "Push to GitHub and deploy to Vercel with one click. Full CI/CD pipeline built in.",
  },
  {
    icon: "📸",
    title: "Screenshot-to-App",
    description:
      "Upload a screenshot or mockup and NEXUS generates pixel-perfect code using GPT-4o vision.",
  },
  {
    icon: "🧠",
    title: "Deep Context Agent",
    description:
      "Cascade-style agent that understands your entire codebase. Makes changes that fit your architecture.",
  },
  {
    icon: "🗄️",
    title: "Supabase-Native",
    description:
      "Built-in database, auth, storage, and real-time. No config required — just describe your data model.",
  },
  {
    icon: "🤖",
    title: "Multi-Agent Planner",
    description:
      "Specialized agents for web, API, database, and deployment work together to build your app.",
  },
  {
    icon: "🔄",
    title: "Autonomous Bug-Fix Loop",
    description:
      "NEXUS runs your code, reads errors, and auto-patches bugs — no manual debugging needed.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to ship
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Combining the best of Lovable, v0, Bolt, Replit, and Windsurf into one platform.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
