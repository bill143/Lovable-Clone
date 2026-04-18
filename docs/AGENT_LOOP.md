# Agent Loop (ASIA — Autonomous Self-Improving Agent)

> **Status:** Stub — implementation planned for PR #5.

## Overview

The Autonomous Self-Improving Agent (ASIA) is a multi-agent loop that sees, reasons, speaks, learns, and self-tests.

## Agent Graph (LangGraph)

```
┌──────────┐     ┌────────┐     ┌────────┐     ┌────────┐     ┌───────────┐
│ Planner  │────►│ Coder  │────►│ Critic │────►│ Tester │────►│ Reflector │
└──────────┘     └────────┘     └────────┘     └────────┘     └───────────┘
      ▲                                                              │
      └──────────────────────────────────────────────────────────────┘
                           (loop until satisfied)
```

## Capabilities

1. **Sees** — Screenshots its output and diffs against the target design using GPT-4o vision.
2. **Reasons** — LangGraph multi-agent orchestration with specialized agents for planning, coding, critiquing, testing, and reflecting.
3. **Talks** — Whisper STT + ElevenLabs TTS with push-to-talk and ambient mode.
4. **Learns** — pgvector memory stores {task, approach, outcome, lessons} for future reference.
5. **Self-Tests** — Runs generated code in E2B sandboxes, reads stderr, and auto-patches errors.
6. **Reflects** — Post-build retrospective writes lessons learned to long-term memory.

## Memory Schema

Each memory entry contains:
- `task` — What was the user trying to build?
- `approach` — What strategy did the agent use?
- `outcome` — Did it succeed? What was the result?
- `lessons` — What should the agent do differently next time?
- `embedding` — Vector embedding for semantic retrieval.
