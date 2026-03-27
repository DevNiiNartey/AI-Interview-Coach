import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in?verify-error=missing', req.url));
  }

  try {
    const ref = db.collection('emailVerifications').doc(token);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.redirect(new URL('/sign-in?verify-error=invalid', req.url));
    }

    const { userId, expiresAt, used } = doc.data()!;

    if (used) {
      return NextResponse.redirect(new URL('/sign-in?verify-error=used', req.url));
    }

    if (Date.now() > expiresAt) {
      return NextResponse.redirect(new URL('/sign-in?verify-error=expired', req.url));
    }

    // Mark user as verified
    await db.collection('users').doc(userId).update({ emailVerified: true });
    await ref.update({ used: true });

    return NextResponse.redirect(new URL('/?verified=true', req.url));
  } catch (e) {
    console.error('Error verifying email:', e);
    return NextResponse.redirect(new URL('/sign-in?verify-error=server', req.url));
  }
}
