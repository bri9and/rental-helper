import { Resend } from 'resend';

// Initialize Resend client
// Will be null if API key is not configured
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isResendConfigured(): boolean {
  return resendApiKey !== undefined &&
         resendApiKey !== '' &&
         resendApiKey !== 're_your_resend_api_key' &&
         resendApiKey !== 're_xxx';
}
