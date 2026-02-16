/*
  # Add payment tracking to analysis sessions

  1. Changes to `analysis_sessions` table
    - Add `payment_completed` (boolean) - Whether payment has been completed
    - Add `payment_type` (text) - Type of payment: 'one_time' or 'subscription'
    - Add `stripe_payment_id` (text) - Stripe payment/session ID for reference
    
  2. Indexes
    - Add index on `payment_completed` for faster queries
    - Add index on `stripe_payment_id` for payment lookups
    - Add composite index on `own_username` and `payment_completed` for user access checks
    
  3. Notes
    - These fields link analysis sessions to payments
    - Allows checking if a specific session has been paid for
    - Enables permanent access to one-time purchased analyses
*/

-- Add payment tracking columns to analysis_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'payment_completed'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN payment_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN payment_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analysis_sessions' AND column_name = 'stripe_payment_id'
  ) THEN
    ALTER TABLE analysis_sessions ADD COLUMN stripe_payment_id text;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_payment_completed 
  ON analysis_sessions(payment_completed);

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_stripe_payment_id 
  ON analysis_sessions(stripe_payment_id);

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_own_username_payment 
  ON analysis_sessions(own_username, payment_completed);
