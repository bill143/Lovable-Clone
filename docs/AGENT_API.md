# Agent API Documentation

## `runAgent` — Public API

The main entry point for the NEXUS agent pipeline.

### Import

```typescript
import { runAgent } from "@nexus/agent-core";
```

### Signature

```typescript
async function* runAgent(input: {
  goal: string;        // Natural language description of what to build
  projectId: string;   // UUID of the project
  maxRetries?: number; // Max Coder→Critic retries per task (default: 3)
  onEvent?: (event: StreamEvent) => void; // Optional callback for each event
}): AsyncGenerator<StreamEvent>
```

### Usage

```typescript
for await (const event of runAgent({ goal: "Build a todo app", projectId: "abc-123" })) {
  console.log(event.type, event.data);
}
```

### StreamEvent Types

| Type | Description | Data |
|------|-------------|------|
| `plan` | Plan generation status | `{ status: "running" }` or `{ status: "complete", plan: Plan }` |
| `task_start` | Task execution begins | `{ taskId, title }` |
| `task_patch` | Code patches generated | `{ taskId, patches: PatchSet }` |
| `task_critique` | Code review result | `{ taskId, critique: CritiqueResult }` |
| `task_test` | Test result | `{ taskId, testResult: TestResult }` |
| `task_reflect` | Memory record written | `{ taskId, memoryRecord: MemoryRecord }` |
| `task_done` | Task completed | `{ taskId, nextIndex }` |
| `error` | Error occurred | `{ message }` |
| `done` | All tasks completed | `{ totalTasks }` |

---

## `/api/agent/run` — SSE Endpoint

### Request

```http
POST /api/agent/run
Content-Type: application/json

{
  "goal": "Build a landing page with hero section and features grid",
  "projectId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response

Server-Sent Events stream. Each event is a JSON-encoded `StreamEvent`:

```
data: {"type":"plan","data":{"status":"running"},"timestamp":1700000001}

data: {"type":"plan","data":{"status":"complete","plan":{"goal":"Build a landing page","tasks":[{"id":"task-1","title":"Create Hero component","deps":[],"acceptanceCriteria":["Full-width hero with title and CTA"],"files":["src/components/Hero.tsx"],"status":"pending"}]}},"timestamp":1700000002}

data: {"type":"task_start","data":{"taskId":"task-1","title":"Create Hero component"},"timestamp":1700000003}

data: {"type":"task_patch","data":{"taskId":"task-1","patches":{"taskId":"task-1","patches":[{"path":"src/components/Hero.tsx","action":"create","content":"..."}]}},"timestamp":1700000004}

data: {"type":"task_critique","data":{"taskId":"task-1","critique":{"pass":true,"issues":[],"suggestions":["Add aria-label to CTA button"]}},"timestamp":1700000005}

data: {"type":"task_test","data":{"taskId":"task-1","testResult":{"pass":true,"logs":["[OK] src/components/Hero.tsx: create — content present","[DRY-RUN] Tester completed"]}},"timestamp":1700000006}

data: {"type":"task_reflect","data":{"taskId":"task-1","memoryRecord":{"task":"Create Hero component","approach":"React component with Tailwind","outcome":"Success","lessons":"Use semantic HTML for hero sections"}},"timestamp":1700000007}

data: {"type":"done","data":{"totalTasks":1},"timestamp":1700000008}
```

### Error Handling

On error, the stream emits an error event and closes:

```
data: {"type":"error","data":{"message":"Missing ANTHROPIC_API_KEY"},"timestamp":1700000001}
```

---

## `/api/agent/history` — History Endpoint

### Request

```http
GET /api/agent/history?projectId=550e8400-e29b-41d4-a716-446655440000
```

### Response

```json
{
  "runs": [
    {
      "id": "run-uuid",
      "project_id": "project-uuid",
      "agent_type": "planner",
      "status": "success",
      "goal": "Build a todo app",
      "plan": { "tasks": [...] },
      "tokens_used": 1500,
      "duration_ms": 12000,
      "started_at": "2025-01-15T10:00:00Z",
      "finished_at": "2025-01-15T10:00:12Z"
    }
  ]
}
```

---

## Individual Agent Exports

Each agent can also be used independently:

```typescript
import {
  plannerAgent,
  coderAgent,
  criticAgent,
  testerAgent,
  reflectorAgent,
} from "@nexus/agent-core";

// Plan
const plan = await plannerAgent({ goal: "Build a blog" });

// Code
const patches = await coderAgent({ task: plan.tasks[0] });

// Critique
const critique = await criticAgent({ task: plan.tasks[0], patches });

// Test (dry-run)
const testResult = await testerAgent({ patches });

// Reflect
const memory = await reflectorAgent({ task: plan.tasks[0], critique, success: true });
```

## Memory Functions

```typescript
import { remember, recall, generateEmbedding } from "@nexus/agent-core";

// Store a memory
await remember(supabase, {
  userId: "user-uuid",
  projectId: "project-uuid",
  memoryType: "lesson",
  content: "Always use TypeScript strict mode",
  metadata: { source: "reflection" },
});

// Recall similar memories
const memories = await recall(supabase, {
  query: "TypeScript configuration best practices",
  k: 5,
  projectId: "project-uuid",
});
```
