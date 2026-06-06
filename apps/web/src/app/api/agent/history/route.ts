import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/agent/history?projectId=xxx
 *
 * Returns past agent runs for a project.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Missing required query parameter: projectId" },
      { status: 400 }
    );
  }

  // Check if Supabase is configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json({
      runs: [],
      message: "Supabase not configured — returning empty history",
    });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("agent_runs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ runs: data ?? [] });
  } catch {
    return NextResponse.json({ runs: [] });
  }
}
