"use server";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  framework: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all projects for the current user.
 */
export async function getProjects(): Promise<Project[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return [];
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch projects:", error.message);
      return [];
    }

    return (data ?? []) as Project[];
  } catch {
    return [];
  }
}

/**
 * Create a new project.
 */
export async function createProject(formData: FormData): Promise<{ id: string } | { error: string }> {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  if (!name) {
    return { error: "Project name is required" };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Supabase not configured" };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({ name, description, user_id: user.id })
      .select("id")
      .single();

    if (error) {
      return { error: error.message };
    }

    return { id: data.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Delete a project.
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
