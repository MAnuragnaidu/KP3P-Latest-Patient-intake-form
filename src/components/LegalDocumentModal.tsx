'use client';

import { useEffect, useId, useRef } from 'react';
import type { LegalDocument } from '@/content/legal-document';
import { legalDocumentParagraphs } from '@/content/legal-document';

type Props = {
  open: boolean;
  document: LegalDocument | null;
  onClose: () => void;
};

export default function LegalDocumentModal({ open, document: doc, onClose }: Props) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !doc) return null;

  const paragraphs = legalDocumentParagraphs(doc.body);

  return (
    <div
      className="legal-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="legal-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="legal-modal-header">
          <div>
            <h2 id={titleId} className="legal-modal-title">
              {doc.title}
            </h2>
            <p className="legal-modal-version">Version {doc.version}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="legal-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="legal-modal-body">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="legal-modal-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="legal-modal-footer">
          <button type="button" className="btn-submit legal-modal-done" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
