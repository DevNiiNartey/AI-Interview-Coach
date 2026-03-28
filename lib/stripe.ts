import Stripe from 'stripe';

// Placeholder key prevents Stripe from throwing during build when env var is not set
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder', {
  apiVersion: '2025-03-31.basil',
});

export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;
