-- ponytail: user settings table for daily review goal
CREATE TABLE IF NOT EXISTS user_settings (
  user_id text PRIMARY KEY,
  daily_review_goal integer NOT NULL DEFAULT 20 CHECK (daily_review_goal > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
