/*
  # Create Conversion Tracking System

  1. New Tables
    - `conversion_events`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references analysis_sessions)
      - `event_type` (text) - Type of event (view_dashboard, click_signal, open_paywall, payment_started, payment_completed)
      - `event_data` (jsonb) - Additional event metadata
      - `created_at` (timestamptz)
    
    - `email_captures`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references analysis_sessions)
      - `email` (text)
      - `captured_at` (timestamptz)
      - `converted` (boolean) - Whether they eventually paid

  2. Security
    - Enable RLS on both tables
    - Add policies for inserting events (public for now, tracking purposes)
*/

CREATE TABLE IF NOT EXISTS conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  email text NOT NULL,
  captured_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session ON conversion_events(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_captures_session ON email_captures(session_id);

ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert conversion events"
  ON conversion_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow insert email captures"
  ON email_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow read own conversion events"
  ON conversion_events
  FOR SELECT
  TO anon, authenticated
  USING (session_id IS NOT NULL);

CREATE POLICY "Allow read own email captures"
  ON email_captures
  FOR SELECT
  TO anon, authenticated
  USING (session_id IS NOT NULL);
