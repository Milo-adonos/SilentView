/*
  # Create premium subscriptions table

  1. New Tables
    - `premium_subscriptions`
      - `id` (uuid, primary key)
      - `user_identifier` (text) - Can be email, username, or device ID
      - `subscription_type` (text) - 'one_time' or 'premium_monthly'
      - `status` (text) - 'active', 'cancelled', 'expired'
      - `started_at` (timestamptz) - When subscription started
      - `expires_at` (timestamptz) - When subscription expires (null for active monthly)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `premium_subscriptions` table
    - Add policy for public access (since we don't have auth yet)
    
  3. Notes
    - For now, we use a simple identifier system
    - In production, this should be tied to a proper authentication system
*/

CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  subscription_type text NOT NULL DEFAULT 'one_time',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_identifier 
  ON premium_subscriptions(user_identifier);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status 
  ON premium_subscriptions(status);

-- Enable RLS
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for checking subscription status)
CREATE POLICY "Allow public read access"
  ON premium_subscriptions
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert (for creating subscriptions)
CREATE POLICY "Allow public insert"
  ON premium_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update (for managing subscriptions)
CREATE POLICY "Allow public update"
  ON premium_subscriptions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);