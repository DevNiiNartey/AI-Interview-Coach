import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/firebase/admin';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    console.error('Stripe webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      if (userId) {
        await db.collection('users').doc(userId).update({
          subscriptionTier: 'pro',
          subscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // Find user by subscriptionId
      const snapshot = await db.collection('users')
        .where('subscriptionId', '==', subscription.id)
        .limit(1)
        .get();
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          subscriptionTier: 'free',
          subscriptionId: null,
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      if (subscriptionId) {
        const snapshot = await db.collection('users')
          .where('subscriptionId', '==', subscriptionId)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            subscriptionTier: 'free',
          });
          console.warn(`Payment failed for subscription ${subscriptionId}, user downgraded to free`);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
