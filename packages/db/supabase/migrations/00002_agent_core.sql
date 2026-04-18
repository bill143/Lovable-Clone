-- PR #2: Agent Core — extend agent_runs and add recent_agent_runs view

-- Add missing columns to agent_runs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agent_runs' AND column_name = 'goal'
  ) THEN
    ALTER TABLE public.agent_runs ADD COLUMN goal text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agent_runs' AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.agent_runs ADD COLUMN plan jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agent_runs' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE public.agent_runs ADD COLUMN started_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agent_runs' AND column_name = 'finished_at'
  ) THEN
    ALTER TABLE public.agent_runs ADD COLUMN finished_at timestamptz;
  END IF;
END $$;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agent_runs_project_id_started_at
  ON public.agent_runs (project_id, started_at DESC);

-- Allow service-role inserts for the agent API route
CREATE POLICY IF NOT EXISTS "Service role can insert agent runs"
  ON public.agent_runs FOR INSERT
  WITH CHECK (true);

-- Create a view for recent agent runs (used by history endpoint)
CREATE OR REPLACE VIEW public.recent_agent_runs AS
SELECT
  ar.id,
  ar.project_id,
  ar.agent_type,
  ar.status,
  ar.goal,
  ar.plan,
  ar.error,
  ar.tokens_used,
  ar.duration_ms,
  ar.started_at,
  ar.finished_at,
  ar.created_at,
  ar.completed_at
FROM public.agent_runs ar
ORDER BY ar.started_at DESC NULLS LAST;

-- Create RPC function for matching agent memories (pgvector similarity search)
CREATE OR REPLACE FUNCTION public.match_agent_memories(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_project_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  task text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    am.id,
    am.memory_type AS task,
    am.content,
    am.metadata,
    1 - (am.embedding <=> query_embedding) AS similarity
  FROM public.agent_memories am
  WHERE
    (filter_project_id IS NULL OR am.project_id = filter_project_id)
    AND am.embedding IS NOT NULL
  ORDER BY am.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
