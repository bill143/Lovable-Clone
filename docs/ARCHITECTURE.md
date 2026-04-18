# NEXUS Architecture

## System Overview

NEXUS is an AI-powered app builder with a Clone Intelligence Engine and Autonomous Self-Improving Agent.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          NEXUS Platform                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  apps/web     │    │ apps/workers │    │  External Services   │  │
│  │  (Next.js 14) │◄──►│  (BullMQ)    │◄──►│  - Anthropic Claude  │  │
│  │              │    │              │    │  - OpenAI GPT-4o     │  │
│  └──────┬───────┘    └──────┬───────┘    │  - ElevenLabs        │  │
│         │                   │            │  - E2B Sandbox       │  │
│         │                   │            │  - StackBlitz        │  │
│         ▼                   ▼            │  - Vercel            │  │
│  ┌──────────────────────────────────┐    │  - GitHub            │  │
│  │        packages/*                │    └──────────────────────┘  │
│  │  ┌────────────┐ ┌─────────────┐  │                              │
│  │  │ agent-core │ │clone-engine │  │                              │
│  │  │ (LangGraph)│ │ (Playwright)│  │                              │
│  │  └────────────┘ └─────────────┘  │                              │
│  │  ┌────────────┐ ┌─────────────┐  │                              │
│  │  │     db     │ │    voice    │  │                              │
│  │  │ (Supabase) │ │ (STT/TTS)  │  │                              │
│  │  └────────────┘ └─────────────┘  │                              │
│  │  ┌────────────┐ ┌─────────────┐  │                              │
│  │  │     ui     │ │webcontainer │  │                              │
│  │  │ (shadcn)   │ │   -host     │  │                              │
│  │  └────────────┘ └─────────────┘  │                              │
│  └──────────────────────────────────┘                              │
│                     │                                               │
│                     ▼                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Supabase                                   │  │
│  │  PostgreSQL + pgvector │ Auth │ Storage │ Realtime │ Edge Fn  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### `apps/web` — Next.js 14 Frontend
- Landing page with NEXUS branding
- Chat-to-app builder UI
- Live WebContainer preview with hot reload
- Visual design-mode editor
- Auth (email + GitHub OAuth via Supabase)
- Dashboard for managing projects, clones, and templates

### `apps/workers` — BullMQ Job Runners
- Background agent execution (clone jobs, build jobs)
- Async code generation and testing
- Deploy pipeline workers

### `packages/agent-core` — LangGraph Agents
- Multi-agent orchestration: Planner → Coder → Critic → Tester → Reflector
- Prompt management and template system
- pgvector memory for learning from past builds
- Context window management

### `packages/clone-engine` — Clone Intelligence Engine
- Playwright + Puppeteer for full-page crawling
- Cheerio for HTML/DOM parsing
- HAR capture for network traffic analysis
- Chrome DevTools Protocol for computed styles
- Framework and state management detection
- API schema inference and OpenAPI generation
- Site Intelligence Report generation

### `packages/db` — Supabase Schema & Client
- Database migrations (users, projects, clones, agent_runs, agent_memories, templates)
- Supabase client wrappers (browser + server)
- Row Level Security policies
- pgvector indexes for semantic memory search

### `packages/ui` — Shared UI Components
- shadcn/ui component library
- Design tokens and theme configuration
- Shared layout components

### `packages/webcontainer-host` — StackBlitz WebContainers
- WebContainers SDK integration
- File system management
- Process spawning (dev server, build, test)
- Hot reload bridge

### `packages/voice` — STT/TTS Wrappers
- Whisper integration for speech-to-text
- ElevenLabs integration for text-to-speech
- Push-to-talk and ambient mode support

## Data Flow

1. **Chat-to-App**: User message → Planner agent → Coder agent → Critic agent → Tester agent → WebContainer preview
2. **Clone Flow**: URL input → Playwright crawl → DOM/CSS/API extraction → LLM analysis → Code generation → Preview
3. **Deploy Flow**: Project → GitHub sync → Vercel deploy → Live URL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Next.js API routes, tRPC, BullMQ + Redis |
| Database | Supabase (PostgreSQL + pgvector + Auth + Storage + Realtime) |
| AI | Anthropic Claude Sonnet 4.5, GPT-4o (vision), Whisper (STT), ElevenLabs (TTS) |
| Agents | LangGraph (Planner → Coder → Critic → Tester → Reflector) |
| Execution | StackBlitz WebContainers SDK, E2B sandboxes |
| Cloning | Playwright, Puppeteer, Cheerio, HAR capture, Chrome DevTools Protocol |
| Deploy | Vercel (app), Railway (workers) |
