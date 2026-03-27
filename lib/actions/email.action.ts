'use server';

import { randomBytes } from 'crypto';
import { db } from '@/firebase/admin';
import { resend, isEmailConfigured } from '@/lib/email';
import { VerificationEmail } from '@/components/emails/VerificationEmail';

export async function sendVerificationEmail(userId: string, email: string, name: string) {
  if (!isEmailConfigured) {
    console.warn('RESEND_API_KEY not configured — skipping verification email');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    await db.collection('emailVerifications').doc(token).set({
      userId,
      email,
      expiresAt,
      used: false,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/api/verify-email?token=${token}`;

    const { error } = await resend.emails.send({
      from: 'AI Coach <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email — AI Coach',
      react: VerificationEmail({ name, verifyUrl }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, message: 'Failed to send verification email' };
    }

    return { success: true };
  } catch (e) {
    console.error('Error sending verification email:', e);
    return { success: false, message: 'Failed to send verification email' };
  }
}

export async function resendVerificationEmail(userId: string) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { success: false, message: 'User not found' };
    }

    const userData = userDoc.data()!;
    if (userData.emailVerified) {
      return { success: false, message: 'Email already verified' };
    }

    return await sendVerificationEmail(userId, userData.email, userData.name);
  } catch (e) {
    console.error('Error resending verification email:', e);
    return { success: false, message: 'Failed to resend verification email' };
  }
}
