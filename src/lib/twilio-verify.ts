import Twilio from 'twilio';
import { toE164IndianMobile } from '@/lib/phone-e164';

const SEND_COOLDOWN_MS = 60_000;

const lastSendByPhone = new Map<string, number>();

export type OtpSendResult = { ok: true } | { ok: false; error: string; retryAfterSeconds?: number };

export type OtpVerifyResult =
  | { ok: true; verifiedAt: string }
  | { ok: false; error: string };

function getTwilioConfig(): {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
} | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!accountSid || !authToken || !verifyServiceSid) return null;
  return { accountSid, authToken, verifyServiceSid };
}

function twilioClient() {
  const config = getTwilioConfig();
  if (!config) {
    throw new Error('Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.');
  }
  return {
    client: Twilio(config.accountSid, config.authToken),
    verifyServiceSid: config.verifyServiceSid,
  };
}

function mapTwilioError(err: unknown): string {
  if (err && typeof err === 'object') {
    const code = 'code' in err ? Number((err as { code?: number }).code) : undefined;
    const message = 'message' in err ? String((err as { message?: string }).message) : '';

    if (code === 60200) {
      return 'Could not send WhatsApp verification to this number. Check the number and that WhatsApp is enabled on your Twilio Verify service.';
    }
    if (code === 60202) return 'Too many verification attempts. Please wait and try again.';
    if (code === 60203) return 'Maximum verification attempts reached. Please request a new code.';
    if (code === 20404) return 'Verification code expired or not found. Please request a new code.';
    if (message) return message;
  }
  return 'Unable to complete verification. Please try again.';
}

export function checkSendCooldown(contactPhone: string): OtpSendResult {
  const lastSent = lastSendByPhone.get(contactPhone);
  if (lastSent == null) return { ok: true };

  const elapsed = Date.now() - lastSent;
  if (elapsed >= SEND_COOLDOWN_MS) return { ok: true };

  const retryAfterSeconds = Math.ceil((SEND_COOLDOWN_MS - elapsed) / 1000);
  return {
    ok: false,
    error: `Please wait ${retryAfterSeconds} seconds before requesting another code.`,
    retryAfterSeconds,
  };
}

export async function sendWhatsAppOtp(contactPhone: string): Promise<OtpSendResult> {
  if (!getTwilioConfig()) {
    return { ok: false, error: 'WhatsApp verification is not configured on the server.' };
  }

  const cooldown = checkSendCooldown(contactPhone);
  if (!cooldown.ok) return cooldown;

  const to = toE164IndianMobile(contactPhone);
  if (!to) {
    return { ok: false, error: 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.' };
  }

  try {
    const { client, verifyServiceSid } = twilioClient();
    await client.verify.v2.services(verifyServiceSid).verifications.create({
      to,
      channel: 'whatsapp',
    });
    lastSendByPhone.set(contactPhone, Date.now());
    return { ok: true };
  } catch (err: unknown) {
    console.error('[sendWhatsAppOtp]', err);
    return { ok: false, error: mapTwilioError(err) };
  }
}

export async function checkWhatsAppOtp(
  contactPhone: string,
  code: string,
): Promise<OtpVerifyResult> {
  if (!getTwilioConfig()) {
    return { ok: false, error: 'WhatsApp verification is not configured on the server.' };
  }

  const to = toE164IndianMobile(contactPhone);
  if (!to) {
    return { ok: false, error: 'Invalid phone number.' };
  }

  const trimmedCode = code.trim();
  if (!/^\d{4,8}$/.test(trimmedCode)) {
    return { ok: false, error: 'Please enter a valid verification code.' };
  }

  try {
    const { client, verifyServiceSid } = twilioClient();
    const check = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to, code: trimmedCode });

    if (check.status === 'approved') {
      return { ok: true, verifiedAt: new Date().toISOString() };
    }

    return { ok: false, error: 'Incorrect verification code. Please try again.' };
  } catch (err: unknown) {
    console.error('[checkWhatsAppOtp]', err);
    return { ok: false, error: mapTwilioError(err) };
  }
}
