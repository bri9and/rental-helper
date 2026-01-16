import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get subscriptions() { return getStripe().subscriptions; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

// Price IDs from Stripe
export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    properties: 5,
    price: 24.95,
  },
  professional: {
    name: 'Pro',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
    properties: 10,
    price: 49.95,
  },
  enterprise: {
    name: 'Max',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    properties: 25,
    price: 99.95,
  },
} as const;

export type PlanId = keyof typeof PLANS;
