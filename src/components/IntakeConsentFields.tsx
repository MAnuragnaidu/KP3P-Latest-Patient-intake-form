'use client';

import { useState } from 'react';
import LegalDocumentModal from '@/components/LegalDocumentModal';
import type { LegalDocument } from '@/content/legal-document';
import { TERMS_AND_CONDITIONS } from '@/content/terms-and-conditions';
import { PRIVACY_POLICY } from '@/content/privacy-policy';

type Props = {
  acceptedTermsPrivacy: boolean;
  acceptedDataCollection: boolean;
  onAcceptedTermsPrivacyChange: (value: boolean) => void;
  onAcceptedDataCollectionChange: (value: boolean) => void;
  termsPrivacyError?: string;
  dataCollectionError?: string;
};

export default function IntakeConsentFields({
  acceptedTermsPrivacy,
  acceptedDataCollection,
  onAcceptedTermsPrivacyChange,
  onAcceptedDataCollectionChange,
  termsPrivacyError,
  dataCollectionError,
}: Props) {
  const [openDocument, setOpenDocument] = useState<LegalDocument | null>(null);

  const openLink = (event: React.MouseEvent, doc: LegalDocument) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenDocument(doc);
  };

  return (
    <>
      <div className="consent-fields">
        <label className={`consent-row${termsPrivacyError ? ' consent-row-err' : ''}`}>
          <input
            type="checkbox"
            checked={acceptedTermsPrivacy}
            onChange={(e) => onAcceptedTermsPrivacyChange(e.target.checked)}
          />
          <span className="consent-label">
            I agree to the{' '}
            <button
              type="button"
              className="consent-link"
              onClick={(e) => openLink(e, TERMS_AND_CONDITIONS)}
            >
              Terms &amp; Conditions
            </button>{' '}
            and{' '}
            <button
              type="button"
              className="consent-link"
              onClick={(e) => openLink(e, PRIVACY_POLICY)}
            >
              Privacy Policy
            </button>
            <span className="req">*</span>
          </span>
        </label>
        {termsPrivacyError && <span className="ferr consent-field-error">{termsPrivacyError}</span>}

        <label className={`consent-row${dataCollectionError ? ' consent-row-err' : ''}`}>
          <input
            type="checkbox"
            checked={acceptedDataCollection}
            onChange={(e) => onAcceptedDataCollectionChange(e.target.checked)}
          />
          <span className="consent-label">
            I consent to the collection and use of my health information for my clinical care.
            <span className="req">*</span>
          </span>
        </label>
        {dataCollectionError && <span className="ferr consent-field-error">{dataCollectionError}</span>}
      </div>

      <LegalDocumentModal
        open={openDocument !== null}
        document={openDocument}
        onClose={() => setOpenDocument(null)}
      />
    </>
  );
}

export { TERMS_AND_CONDITIONS, PRIVACY_POLICY };
