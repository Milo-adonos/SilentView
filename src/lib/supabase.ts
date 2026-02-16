import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AnalysisSession {
  id?: string;
  own_username: string;
  target_username: string;
  social_network: 'tiktok' | 'instagram';
  context_type: 'ex_crush' | 'friend' | 'business' | 'curiosity';
  question_1_answer: string;
  question_2_answer: string;
  prediction_value: number;
  created_at?: string;
  payment_completed?: boolean;
  payment_type?: 'one_time' | 'subscription';
  stripe_payment_id?: string;
}

export async function saveAnalysisSession(session: Omit<AnalysisSession, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('analysis_sessions')
    .insert(session)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving analysis session:', error);
    return null;
  }

  return data;
}

export async function getAnalysisSession(sessionId: string): Promise<AnalysisSession | null> {
  const { data, error } = await supabase
    .from('analysis_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching analysis session:', error);
    return null;
  }

  return data;
}

export async function createStripeCheckout(
  sessionId: string,
  paymentType: 'one_time' | 'subscription',
  userIdentifier: string,
  userId?: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/stripe-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          sessionId,
          paymentType,
          userIdentifier,
          userId,
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to create checkout session');
      return null;
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

export async function checkUserAccess(
  userIdentifier: string,
  sessionId?: string
): Promise<boolean> {
  const { data: subscription } = await supabase
    .from('premium_subscriptions')
    .select('*')
    .eq('user_identifier', userIdentifier)
    .eq('status', 'active')
    .maybeSingle();

  if (subscription && subscription.subscription_type === 'premium_monthly') {
    return true;
  }

  if (sessionId) {
    const { data: session } = await supabase
      .from('analysis_sessions')
      .select('payment_completed')
      .eq('id', sessionId)
      .eq('own_username', userIdentifier)
      .eq('payment_completed', true)
      .maybeSingle();

    if (session) {
      return true;
    }
  }

  return false;
}
