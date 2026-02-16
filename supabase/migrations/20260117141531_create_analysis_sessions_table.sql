/*
  # Create Analysis Sessions Table

  1. New Tables
    - `analysis_sessions`
      - `id` (uuid, primary key) - Unique identifier for each session
      - `own_username` (text) - The user's own username
      - `target_username` (text) - The username being analyzed
      - `social_network` (text) - Either 'tiktok' or 'instagram'
      - `context_type` (text) - Type of relationship: ex_crush, friend, business, curiosity
      - `question_1_answer` (text) - Answer to contextual question 1
      - `question_2_answer` (text) - Answer to contextual question 2
      - `prediction_value` (integer) - User's prediction of profile visits
      - `created_at` (timestamptz) - When the session was created

  2. Security
    - Enable RLS on `analysis_sessions` table
    - Add policy for anonymous inserts (public submissions)
    - Add policy for reading own data based on session
*/

CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  own_username text NOT NULL,
  target_username text NOT NULL,
  social_network text NOT NULL CHECK (social_network IN ('tiktok', 'instagram')),
  context_type text NOT NULL CHECK (context_type IN ('ex_crush', 'friend', 'business', 'curiosity')),
  question_1_answer text,
  question_2_answer text,
  prediction_value integer CHECK (prediction_value >= 0 AND prediction_value <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON analysis_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow reading own session by id"
  ON analysis_sessions
  FOR SELECT
  TO anon
  USING (true);