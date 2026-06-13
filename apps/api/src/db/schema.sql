create extension if not exists pgcrypto;

create table articles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  source_type text not null check (source_type in ('txt', 'markdown')),
  raw_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table segments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  article_id uuid not null references articles(id) on delete cascade,
  sequence integer not null,
  text text not null,
  word_count integer not null check (word_count >= 0),
  generation_status text not null check (generation_status in ('not_generated', 'generating', 'generated', 'failed', 'retryable')),
  progress_status text not null check (progress_status in ('unread', 'reading', 'read')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (article_id, sequence)
);

create table candidate_expressions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  article_id uuid not null references articles(id) on delete cascade,
  segment_id uuid not null references segments(id) on delete cascade,
  expression text not null,
  normalized_form text not null,
  type text not null check (type in ('phrasal_verb', 'collocation', 'idiom', 'sentence_pattern', 'other')),
  meaning_zh text not null,
  local_meaning text not null,
  sentence text not null,
  sentence_translation text not null,
  syntax_hint text,
  difficulty text not null check (difficulty in ('A2', 'B1', 'B2', 'C1', 'C2')),
  value_score integer not null check (value_score >= 0),
  candidate_status text not null check (candidate_status in ('selected', 'backup_candidate', 'ignored_too_easy', 'ignored_duplicate', 'ignored_over_limit')),
  status_reason text not null,
  occurrence_count integer not null default 1 check (occurrence_count >= 0),
  model_provider text not null,
  model_name text not null,
  prompt_version text not null,
  generation_version text not null,
  generated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table expression_senses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  expression text not null,
  normalized_form text not null,
  type text not null check (type in ('phrasal_verb', 'collocation', 'idiom', 'sentence_pattern', 'other')),
  meaning_zh text not null,
  difficulty text not null check (difficulty in ('A2', 'B1', 'B2', 'C1', 'C2')),
  mastery_status text not null check (mastery_status in ('new', 'learning', 'review', 'mastered')),
  srs_due_at timestamptz,
  review_count integer not null default 0 check (review_count >= 0),
  mistake_count integer not null default 0 check (mistake_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index expression_senses_active_unique
  on expression_senses (user_id, normalized_form, type, meaning_zh)
  where deleted_at is null;

create table occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  expression_sense_id uuid not null references expression_senses(id) on delete cascade,
  source_type text not null default 'article' check (source_type in ('article', 'context_entry')),
  article_id uuid references articles(id) on delete set null,
  segment_id uuid references segments(id) on delete set null,
  context_label text,
  context_note text,
  sentence text not null,
  sentence_translation text not null,
  local_meaning text not null,
  syntax_hint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (
    (source_type = 'article' and article_id is not null and segment_id is not null)
    or
    (source_type = 'context_entry' and context_label is not null)
  )
);

create table review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  expression_sense_id uuid not null references expression_senses(id) on delete cascade,
  feedback text not null check (feedback in ('known', 'fuzzy', 'unknown')),
  previous_due_at timestamptz,
  next_due_at timestamptz not null,
  reviewed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table client_operations (
  id uuid primary key default gen_random_uuid(),
  client_operation_id text not null unique,
  user_id text not null,
  operation_type text not null,
  target_type text not null,
  target_id text not null,
  payload jsonb not null default '{}'::jsonb,
  client_created_at timestamptz not null,
  sync_status text not null check (sync_status in ('pending', 'synced', 'failed')),
  server_applied_at timestamptz,
  created_at timestamptz not null default now()
);

create table ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  article_id uuid references articles(id) on delete cascade,
  segment_id uuid references segments(id) on delete cascade,
  source_type text not null check (source_type in ('segment_preselection', 'manual_selection', 'context_entry')),
  selected_text text,
  context_label text,
  context_note text,
  sentence text,
  context text,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed', 'retryable')),
  client_operation_id text unique,
  model_provider text,
  model_name text,
  prompt_version text,
  generation_version text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index segments_article_sequence_idx on segments (article_id, sequence);
create index candidate_expressions_segment_idx on candidate_expressions (segment_id, candidate_status);
create index occurrences_expression_sense_idx on occurrences (expression_sense_id);
create index review_logs_expression_sense_idx on review_logs (expression_sense_id, reviewed_at desc);
create index client_operations_user_status_idx on client_operations (user_id, sync_status, client_created_at);
create index ai_generation_jobs_user_status_idx on ai_generation_jobs (user_id, status, created_at);
