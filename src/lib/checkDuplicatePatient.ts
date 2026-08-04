import { getAdminApiConfigError, getAdminApiUrl } from '@/lib/adminApiUrl';

export type DuplicateCheckField = 'email' | 'contactPhone';

export type DuplicateCheckResult =
  | { ok: true }
  | { ok: false; error: string; field?: DuplicateCheckField };

export async function checkDuplicatePatient(
  email: string,
  contactPhone: string,
): Promise<DuplicateCheckResult> {
  const apiUrl = getAdminApiUrl();
  if (!apiUrl) {
    return { ok: false, error: getAdminApiConfigError() };
  }

  try {
    const res = await fetch(`${apiUrl}/api/patients/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), contactPhone: contactPhone.trim() }),
    });

    let resData: { error?: string; field?: DuplicateCheckField } = {};
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        resData = await res.json();
      }
    } catch {
      // ignore parse failures
    }

    if (!res.ok) {
      return {
        ok: false,
        error: resData.error || `Unable to verify patient details (error ${res.status}). Please try again.`,
        field: resData.field,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Network error occurred. Please check your connection and try again.',
    };
  }
}
