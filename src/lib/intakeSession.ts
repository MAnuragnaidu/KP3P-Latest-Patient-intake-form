/** After a successful submit, block /form until a new browser session (sessionStorage cleared). */
export const INTAKE_SUBMITTED_KEY = 'mygastro_intake_submitted';

/** Landing page stores name, email, phone, and consent before opening the intake form. */
export const PATIENT_ENTRY_KEY = 'patient_entry';

export type IntakeConsent = {
  termsPrivacyAcceptedAt: string;
  dataCollectionConsentAt: string;
  termsVersion: string;
  privacyVersion: string;
  dataConsentVersion: string;
};

export type PatientEntry = {
  name: string;
  email: string;
  contactPhone: string;
  consent?: IntakeConsent;
  phoneVerifiedAt?: string;
};

export function buildIntakeConsent(
  termsVersion: string,
  privacyVersion: string,
  dataConsentVersion: string,
): IntakeConsent {
  const now = new Date().toISOString();
  return {
    termsPrivacyAcceptedAt: now,
    dataCollectionConsentAt: now,
    termsVersion,
    privacyVersion,
    dataConsentVersion,
  };
}
