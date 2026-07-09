-- ponytail: cache LLM-extracted highlights, avoid re-calling on every page load
ALTER TABLE segments ADD COLUMN IF NOT EXISTS highlights jsonb;
