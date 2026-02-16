/*
  # Add User Authentication Support

  1. Changes to Existing Tables
    - `analysis_sessions`: Add `user_id` column to link analyses to authenticated users
    - `premium_subscriptions`: Add `user_id` column to link subscriptions to authenticated users
  
  2. New Tables
    - `user_alerts`: Store accounts that premium users want to monitor for real-time alerts
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `target_username` (text)
      - `social_network` (text: tiktok or instagram)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
  
  3. Security
    - Enable RLS on user_alerts
    - Add policies for authenticated users to manage their own data
*/

-- Add user_id column to analysis_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add user_id column to premium_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'premium_subscriptions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE premium_subscriptions ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create user_alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  target_username text NOT NULL,
  social_network text NOT NULL CHECK (social_network IN ('tiktok', 'instagram')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);

-- Enable RLS on user_alerts
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_alerts
CREATE POLICY "Users can view own alerts"
  ON user_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts"
  ON user_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON user_alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON user_alerts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for analysis_sessions (update existing to include user-based access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own analysis sessions'
  ) THEN
    CREATE POLICY "Users can view own analysis sessions"
      ON analysis_sessions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS policies for premium_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own subscription'
  ) THEN
    CREATE POLICY "Users can view own subscription"
      ON premium_subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
