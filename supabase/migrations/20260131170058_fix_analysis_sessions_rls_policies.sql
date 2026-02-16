/*
  # Fix RLS policies for analysis_sessions table

  1. Problem
    - Current INSERT policy only allows 'anon' role
    - Authenticated users cannot insert new analysis sessions
    - This prevents logged-in users from starting new analyses

  2. Changes
    - Add INSERT policy for authenticated users
    - Add UPDATE policy for authenticated users to update their own sessions

  3. Security
    - Authenticated users can insert sessions
    - Authenticated users can update sessions linked to their user_id
*/

DROP POLICY IF EXISTS "Authenticated users can insert analysis sessions" ON analysis_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own sessions" ON analysis_sessions;

CREATE POLICY "Authenticated users can insert analysis sessions"
  ON analysis_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own sessions"
  ON analysis_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);