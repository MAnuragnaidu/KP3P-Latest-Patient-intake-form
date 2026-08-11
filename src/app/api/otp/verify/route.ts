import { NextRequest, NextResponse } from 'next/server';
import { isValidContactPhone } from '@/lib/formSchema';
import { checkWhatsAppOtp } from '@/lib/twilio-verify';

export const runtime = 'nodejs';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const raw: unknown = await req.json().catch(() => null);
    if (!isRecord(raw)) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const contactPhone =
      typeof raw.contactPhone === 'string' ? raw.contactPhone.trim() : '';
    const code = typeof raw.code === 'string' ? raw.code.trim() : '';

    if (!contactPhone || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required.' },
        { status: 400 },
      );
    }
    if (!isValidContactPhone(contactPhone)) {
      return NextResponse.json(
        { error: 'Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.' },
        { status: 400 },
      );
    }

    const result = await checkWhatsAppOtp(contactPhone, code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, verifiedAt: result.verifiedAt });
  } catch (err: unknown) {
    console.error('[POST /api/otp/verify]', err);
    return NextResponse.json({ error: 'Failed to verify code.' }, { status: 500 });
  }
}
