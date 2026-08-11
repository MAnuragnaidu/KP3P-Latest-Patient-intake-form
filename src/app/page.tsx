'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import IntakeConsentFields, {
  PRIVACY_POLICY,
  TERMS_AND_CONDITIONS,
} from '@/components/IntakeConsentFields';
import OtpSixDigitInput from '@/components/OtpSixDigitInput';
import { DATA_COLLECTION_CONSENT } from '@/content/data-collection-consent';
import {
  isValidContactPhone,
  isValidEmail,
  normalizeContactPhoneInput,
} from '@/lib/formSchema';
import { checkDuplicatePatient } from '@/lib/checkDuplicatePatient';
import {
  buildIntakeConsent,
  INTAKE_SUBMITTED_KEY,
  PATIENT_ENTRY_KEY,
  type PatientEntry,
} from '@/lib/intakeSession';

type OtpPhase = 'idle' | 'sent' | 'verified';

function phoneLastFour(phone: string): string {
  return phone.length >= 4 ? phone.slice(-4) : phone;
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [acceptedTermsPrivacy, setAcceptedTermsPrivacy] = useState(false);
  const [acceptedDataCollection, setAcceptedDataCollection] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    contactPhone?: string;
    termsPrivacy?: string;
    dataCollection?: string;
    otp?: string;
  }>({});
  const [isBusy, setIsBusy] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [otpPhase, setOtpPhase] = useState<OtpPhase>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAlreadySubmitted(sessionStorage.getItem(INTAKE_SUBMITTED_KEY) === '1');
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = contactPhone.trim();

  const formValid =
    Boolean(trimmedName && trimmedEmail && trimmedPhone) &&
    isValidEmail(trimmedEmail) &&
    isValidContactPhone(trimmedPhone) &&
    acceptedTermsPrivacy &&
    acceptedDataCollection;

  const canSubmitIdle = formValid && !alreadySubmitted && !isBusy && otpPhase === 'idle';
  const canSubmitSent =
    formValid &&
    !alreadySubmitted &&
    !isBusy &&
    otpPhase === 'sent' &&
    /^\d{6}$/.test(otpCode.trim());

  const resetOtpState = useCallback(() => {
    setOtpPhase('idle');
    setOtpCode('');
    setPhoneVerifiedAt(null);
    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
  }, []);

  const validateForm = (): boolean => {
    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      setError('Full name, email, and phone number are required.');
      return false;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!isValidContactPhone(trimmedPhone)) {
      setError('Phone number must be exactly 10 digits and start with 6, 7, 8, or 9.');
      return false;
    }
    if (!acceptedTermsPrivacy || !acceptedDataCollection) {
      const nextFieldErrors: typeof fieldErrors = {};
      if (!acceptedTermsPrivacy) {
        nextFieldErrors.termsPrivacy = 'You must accept the Terms & Conditions and Privacy Policy.';
      }
      if (!acceptedDataCollection) {
        nextFieldErrors.dataCollection = 'You must consent to data collection to continue.';
      }
      setFieldErrors(nextFieldErrors);
      setError('Please complete all required consent checkboxes.');
      return false;
    }
    return true;
  };

  const sendOtp = async (): Promise<boolean> => {
    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
    setError('');

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactPhone: trimmedPhone }),
      });

      let data: { error?: string; retryAfterSeconds?: number } = {};
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        const msg = data.error || 'Failed to send WhatsApp verification code.';
        setError(msg);
        setFieldErrors((prev) => ({ ...prev, otp: msg }));
        if (data.retryAfterSeconds) {
          setResendCooldown(data.retryAfterSeconds);
        }
        return false;
      }

      setOtpPhase('sent');
      setOtpCode('');
      setResendCooldown(60);
      setError('');
      return true;
    } catch {
      const msg = 'Network error. Please check your connection and try again.';
      setError(msg);
      setFieldErrors((prev) => ({ ...prev, otp: msg }));
      return false;
    }
  };

  const verifyOtp = async (): Promise<string | null> => {
    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
    setError('');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactPhone: trimmedPhone, code: otpCode.trim() }),
      });

      let data: { error?: string; verifiedAt?: string } = {};
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok || !data.verifiedAt) {
        setFieldErrors((prev) => ({
          ...prev,
          otp: data.error || 'Verification failed. Please try again.',
        }));
        return null;
      }

      setPhoneVerifiedAt(data.verifiedAt);
      setOtpPhase('verified');
      return data.verifiedAt;
    } catch {
      setFieldErrors((prev) => ({
        ...prev,
        otp: 'Network error. Please check your connection and try again.',
      }));
      return null;
    }
  };

  const proceedAfterVerification = async (verifiedAt: string) => {
    const duplicate = await checkDuplicatePatient(trimmedEmail, trimmedPhone);
    if (!duplicate.ok) {
      if (duplicate.field === 'email' || duplicate.field === 'contactPhone') {
        setFieldErrors({ [duplicate.field]: duplicate.error });
      } else {
        setError(duplicate.error);
      }
      return;
    }

    const entry: PatientEntry = {
      name: trimmedName,
      email: trimmedEmail,
      contactPhone: trimmedPhone,
      phoneVerifiedAt: verifiedAt,
      consent: buildIntakeConsent(
        TERMS_AND_CONDITIONS.version,
        PRIVACY_POLICY.version,
        DATA_COLLECTION_CONSENT.version,
      ),
    };
    sessionStorage.setItem(PATIENT_ENTRY_KEY, JSON.stringify(entry));
    router.push('/form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && sessionStorage.getItem(INTAKE_SUBMITTED_KEY) === '1') {
      setError(
        'You have already submitted your intake for this session. Close the browser or open a private window if you need to submit again.',
      );
      return;
    }

    if (!validateForm()) return;

    setError('');
    setIsBusy(true);

    try {
      if (otpPhase === 'idle') {
        await sendOtp();
        return;
      }

      if (otpPhase === 'sent') {
        const verifiedAt = await verifyOtp();
        if (!verifiedAt) return;
        await proceedAfterVerification(verifiedAt);
        return;
      }

      if (otpPhase === 'verified' && phoneVerifiedAt) {
        await proceedAfterVerification(phoneVerifiedAt);
      }
    } catch {
      setError('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isBusy) return;
    if (!validateForm()) return;
    setIsBusy(true);
    try {
      await sendOtp();
    } finally {
      setIsBusy(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setContactPhone(normalizeContactPhoneInput(value));
    if (fieldErrors.contactPhone) {
      setFieldErrors((prev) => ({ ...prev, contactPhone: undefined }));
    }
    if (otpPhase !== 'idle') {
      resetOtpState();
    }
  };

  const submitLabel =
    isBusy && otpPhase === 'idle'
      ? 'Sending code…'
      : isBusy && otpPhase === 'sent'
        ? 'Verifying…'
        : isBusy
          ? 'Please wait…'
          : otpPhase === 'sent'
            ? 'Verify & Continue'
            : 'Begin Intake Form';

  return (
    <>
      <style>{`
        .landing-card-head { text-align: center; padding: 8px 24px 6px; }
        .landing-card-head .step-title { margin: 0; font-size: 18px; }
        .home-landing .step-body.landing-card-body { padding: 16px 28px 28px; }
        @media (max-width: 480px) {
          .landing-card-head { padding: 6px 20px 4px; }
          .home-landing .step-body.landing-card-body { padding: 16px 20px 24px; }
        }
        .home-landing.page-root {
          background: linear-gradient(180deg, #ffffff 0%, #f4f8fa 32%, #eef3f6 100%);
        }
        .home-landing .page-header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
        }
        .home-landing .header-tag {
          color: #0e7490;
          background: rgba(8, 145, 178, 0.1);
          border: 1px solid rgba(8, 145, 178, 0.22);
        }
      `}</style>
      <div className="page-root home-landing" style={{ justifyContent: 'center' }}>
        <header className="page-header" style={{ position: 'absolute', width: '100%', top: 0 }}>
          <div className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/mygastro-logo.png"
              alt="myGastro.AI"
              style={{ height: 28, width: 'auto', display: 'block' }}
            />
          </div>
          <div className="header-tag">Patient Portal</div>
        </header>

        <main
          className="page-main"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80 }}
        >
          <div className="step-card" style={{ maxWidth: 440, width: '100%' }}>
            <div className="step-card-head landing-card-head">
              <h1 className="step-title">Welcome!</h1>
            </div>

            <div className="step-body landing-card-body">
              {alreadySubmitted && (
                <div
                  className="ferr"
                  style={{
                    marginBottom: 16,
                    padding: '10px 12px',
                    background: 'var(--error-bg)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  You have already submitted your intake for this browser session. To use the intake
                  form again, close all tabs for this site or use a private/incognito window.
                </div>
              )}
              {error && (
                <div
                  className="ferr"
                  style={{
                    marginBottom: 16,
                    padding: '10px 12px',
                    background: 'var(--error-bg)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="fg" style={{ gap: 16 }}>
                <div className="fg">
                  <label htmlFor="name">
                    Full Name<span className="req">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="fi"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    disabled={otpPhase === 'sent' && isBusy}
                  />
                </div>

                <div className="fg">
                  <label htmlFor="email">
                    Email Address<span className="req">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`fi${fieldErrors.email ? ' err' : ''}`}
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    required
                    autoComplete="email"
                    disabled={otpPhase === 'sent' && isBusy}
                  />
                  {fieldErrors.email && <span className="ferr">{fieldErrors.email}</span>}
                </div>

                <div className="fg">
                  <label htmlFor="contactPhone">
                    Phone Number<span className="req">*</span>
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    className={`fi${fieldErrors.contactPhone ? ' err' : ''}`}
                    placeholder="e.g. 9876543210"
                    value={contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    required
                    autoComplete="tel"
                    disabled={otpPhase === 'sent' && isBusy}
                  />
                  {fieldErrors.contactPhone && <span className="ferr">{fieldErrors.contactPhone}</span>}
                </div>

                <IntakeConsentFields
                  acceptedTermsPrivacy={acceptedTermsPrivacy}
                  acceptedDataCollection={acceptedDataCollection}
                  onAcceptedTermsPrivacyChange={(value) => {
                    setAcceptedTermsPrivacy(value);
                    if (value && fieldErrors.termsPrivacy) {
                      setFieldErrors((prev) => ({ ...prev, termsPrivacy: undefined }));
                    }
                  }}
                  onAcceptedDataCollectionChange={(value) => {
                    setAcceptedDataCollection(value);
                    if (value && fieldErrors.dataCollection) {
                      setFieldErrors((prev) => ({ ...prev, dataCollection: undefined }));
                    }
                  }}
                  termsPrivacyError={fieldErrors.termsPrivacy}
                  dataCollectionError={fieldErrors.dataCollection}
                />

                {otpPhase === 'sent' && (
                  <div className="otp-panel">
                    <p className="otp-helper">
                      We sent a verification code to your WhatsApp number ending in{' '}
                      <strong>{phoneLastFour(trimmedPhone)}</strong>.
                    </p>
                    <div className="fg" style={{ margin: 0, alignItems: 'center' }}>
                      <label>Verification code<span className="req">*</span></label>
                      <OtpSixDigitInput
                        value={otpCode}
                        onChange={(next) => {
                          setOtpCode(next);
                          if (fieldErrors.otp) {
                            setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                          }
                          if (error) setError('');
                        }}
                        disabled={isBusy}
                        hasError={Boolean(fieldErrors.otp)}
                      />
                      {fieldErrors.otp && <span className="ferr">{fieldErrors.otp}</span>}
                    </div>
                    <div className="otp-resend-row">
                      <button
                        type="button"
                        className="otp-resend-btn"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || isBusy}
                      >
                        Resend code
                      </button>
                      {resendCooldown > 0 && (
                        <span className="otp-resend-hint">Available in {resendCooldown}s</span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-submit"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: 8,
                    padding: '12px 24px',
                  }}
                  disabled={
                    alreadySubmitted ||
                    isBusy ||
                    (otpPhase === 'idle' ? !canSubmitIdle : !canSubmitSent)
                  }
                >
                  {submitLabel}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
