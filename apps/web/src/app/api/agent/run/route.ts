import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/agent/run
 *
 * Accepts { goal, projectId } and streams Server-Sent Events back to the client.
 * Each event has the format: data: { type, data, timestamp }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, projectId } = body as { goal?: string; projectId?: string };

    if (!goal || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields: goal and projectId" },
        { status: 400 }
      );
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Dynamic import to avoid issues when agent-core deps aren't available
          const { runAgent } = await import("@nexus/agent-core");

          const events: Array<{ type: string; data: unknown; timestamp: number }> = [];

          for await (const event of runAgent({
            goal,
            projectId,
            onEvent: (e) => {
              events.push(e);
            },
          })) {
            const sseData = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }

          // Send done event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", data: { events: events.length }, timestamp: Date.now() })}\n\n`
            )
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", data: { message }, timestamp: Date.now() })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
