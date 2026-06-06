# NEXUS — AI-Powered App Builder

> Elite AI app/website builder with Clone Intelligence Engine and Autonomous Self-Improving Agent.

[![CI](https://github.com/bill143/Lovable-Clone/actions/workflows/ci.yml/badge.svg)](https://github.com/bill143/Lovable-Clone/actions/workflows/ci.yml)

## Overview

NEXUS is a next-generation AI-powered app builder that combines the best of Lovable, v0.dev, Bolt.new, Replit Agent, and Windsurf. It features:

- **Chat-to-App Builder** — Describe your app in natural language and watch it come to life
- **Clone Intelligence Engine** — Paste any URL to reverse-engineer and clone any website
- **Autonomous Self-Improving Agent** — An AI that sees, reasons, speaks, learns, and self-corrects
- **Live WebContainer Preview** — Real-time preview with hot reload
- **Visual Design Mode** — Point-and-click editing with design tokens
- **GitHub Sync & Vercel Deploy** — One-click deployment pipeline
- **Supabase-Native** — Built-in database, auth, storage, and real-time

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Next.js API routes, tRPC, BullMQ + Redis |
| Database | Supabase (PostgreSQL + pgvector + Auth + Storage + Realtime) |
| AI | Claude Sonnet 4.5, GPT-4o, Whisper, ElevenLabs |
| Agents | LangGraph multi-agent orchestration |
| Execution | StackBlitz WebContainers, E2B sandboxes |
| Cloning | Playwright, Puppeteer, Cheerio, Chrome DevTools Protocol |

## Quickstart

```bash
# Prerequisites: Node.js >= 18, pnpm >= 9

# Clone the repository
git clone https://github.com/bill143/Lovable-Clone.git
cd Lovable-Clone

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start the development server
pnpm dev
```

## Project Structure

```
nexus/
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   └── workers/              # BullMQ job runners
├── packages/
│   ├── agent-core/           # LangGraph agents, prompts, memory
│   ├── clone-engine/         # Playwright + extractors
│   ├── db/                   # Supabase schema + migrations
│   ├── ui/                   # shadcn/ui shared components
│   ├── voice/                # STT/TTS wrappers
│   └── webcontainer-host/    # StackBlitz WebContainers SDK
├── docs/
│   ├── ARCHITECTURE.md       # System diagram & component responsibilities
│   ├── CLONE_ENGINE.md       # Clone Intelligence Engine design
│   └── AGENT_LOOP.md         # Autonomous agent loop design
├── .github/workflows/ci.yml  # GitHub Actions CI
├── turbo.json                # Turborepo config
└── pnpm-workspace.yaml       # pnpm workspace config
```

## Roadmap

| PR | Milestone | Status |
|----|-----------|--------|
| #1 | Foundation — monorepo scaffold, landing page, auth, schema | ✅ |
| #2 | Agent Core — LangGraph agents, prompts, memory | ✅ |
| #3 | WebContainer Builder — StackBlitz integration, live preview | 🔜 |
| #4 | Clone Intelligence Engine — URL-to-clone pipeline | 🔜 |
| #5 | Autonomous Loop — self-test, self-fix, reflection | 🔜 |
| #6 | Voice & Multimodal — Whisper STT, ElevenLabs TTS | 🔜 |
| #7 | Visual Design Mode — point-and-click editor | 🔜 |
| #8 | GitHub + Vercel Integration — repo sync, one-click deploy | 🔜 |
| #9 | Templates & Marketplace — community templates | 🔜 |
| #10 | Polish & Docs — final refinements | 🔜 |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System overview and component responsibilities
- [Clone Engine](docs/CLONE_ENGINE.md) — Clone Intelligence Engine design
- [Agent Loop](docs/AGENT_LOOP.md) — Autonomous Self-Improving Agent design
- [Agent API](docs/AGENT_API.md) — `runAgent` API and SSE contract documentation

## Credits

Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Turborepo](https://turbo.build/), and AI.

## License

MIT
