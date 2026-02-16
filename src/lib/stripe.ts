import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key is not configured');
}

export const stripePromise = loadStripe(stripePublishableKey || '');

export type PaymentType = 'one_time' | 'subscription';

interface CheckoutParams {
  sessionId: string;
  paymentType: PaymentType;
  userIdentifier: string;
  userId?: string;
}

// Create a checkout session via Supabase Edge Function
export async function createCheckoutSession(params: CheckoutParams): Promise<string | null> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(params),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Checkout error:', error);
      return null;
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return null;
  }
}

// Generate a unique session ID for tracking
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Redirect to Stripe Checkout for one-time payment (6.99€)
export async function redirectToUnlockCheckout(
  userId: string,
  userEmail: string
): Promise<void> {
  const sessionId = generateSessionId();
  
  const checkoutUrl = await createCheckoutSession({
    sessionId,
    paymentType: 'one_time',
    userIdentifier: userEmail,
    userId,
  });
  
  if (checkoutUrl) {
    // Save session data to sessionStorage before redirect
    sessionStorage.setItem('pending_payment_session', sessionId);
    window.location.href = checkoutUrl;
  } else {
    throw new Error('Failed to create checkout session');
  }
}

// Redirect to Stripe Checkout for subscription (13.99€/month)
export async function redirectToSubscriptionCheckout(
  userId: string,
  userEmail: string
): Promise<void> {
  const sessionId = generateSessionId();
  
  const checkoutUrl = await createCheckoutSession({
    sessionId,
    paymentType: 'subscription',
    userIdentifier: userEmail,
    userId,
  });
  
  if (checkoutUrl) {
    sessionStorage.setItem('pending_payment_session', sessionId);
    window.location.href = checkoutUrl;
  } else {
    throw new Error('Failed to create checkout session');
  }
}

// Check if returning from successful payment
export function checkPaymentSuccess(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('payment') === 'success';
}

// Check if payment was cancelled
export function checkPaymentCancelled(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('payment') === 'cancelled';
}

// Clear payment URL params
export function clearPaymentParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('payment');
  url.searchParams.delete('session_id');
  url.searchParams.delete('payment_type');
  window.history.replaceState({}, '', url.pathname);
}
