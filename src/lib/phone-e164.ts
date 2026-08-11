import { isValidContactPhone } from '@/lib/formSchema';

const INDIA_COUNTRY_CODE = '+91';

/** E.164 for Indian mobile: +91XXXXXXXXXX */
export function toE164IndianMobile(phone: string): string | null {
  const trimmed = phone.trim();
  if (!isValidContactPhone(trimmed)) return null;
  return `${INDIA_COUNTRY_CODE}${trimmed}`;
}

/** Twilio Verify `To` for WhatsApp channel — E.164 only (channel is set separately). */
export function toTwilioVerifyTo(phone: string): string | null {
  return toE164IndianMobile(phone);
}
