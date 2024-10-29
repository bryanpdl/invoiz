import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Invoice } from '../types/invoice';

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export async function initiateStripePayment(invoice: Invoice) {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Failed to initialize Stripe. Please check your publishable key.');
  }
  
  try {
    console.log('Initiating Stripe payment with invoice:', JSON.stringify(invoice, null, 2));

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoice }),
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}\n${responseText}`);
    }

    let session;
    try {
      session = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse response: ${error}\nResponse text: ${responseText}`);
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
}

export function initiatePayPalPayment(invoice: Invoice) {
  // Implement PayPal payment initiation
  // This will depend on which PayPal SDK or API you're using
  console.log('Initiating PayPal payment for invoice:', invoice);
}
