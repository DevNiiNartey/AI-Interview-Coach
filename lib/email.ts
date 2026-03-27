import { Resend } from 'resend';

// Resend requires an API key at construction time.
// Use a placeholder to avoid build errors when key is not yet configured.
export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder_key');
export const isEmailConfigured = !!process.env.RESEND_API_KEY;
