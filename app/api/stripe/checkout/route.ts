import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/actions/auth.action';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const billing = req.nextUrl.searchParams.get('billing') || 'annual';
  const priceId = billing === 'annual'
    ? process.env.STRIPE_ANNUAL_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    client_reference_id: user.id,
    customer_email: user.email,
    metadata: { userId: user.id },
  });

  return NextResponse.redirect(session.url!);
}
