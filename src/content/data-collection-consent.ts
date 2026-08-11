import type { LegalDocument } from './legal-document';

export const DATA_COLLECTION_CONSENT: LegalDocument = {
  title: 'Patient Data Collection Notice',
  version: '1.0',
  body: `Consent for Collection and Use of Health Information

Purpose
By providing consent, you authorise myGastro.AI and your treating clinical team to collect, store, and use the health information you submit through this patient intake form for the purpose of clinical assessment, care planning, and related healthcare operations.

What You Are Consenting To
• Collection of personal identifiers (name, email, phone number)
• Collection of clinical and health-related information you enter in the form
• Storage of this information in secure clinical systems
• Use of this information by authorised clinicians for your care
• Processing necessary to generate clinical documentation (such as care sheets) where applicable

Voluntary Participation
Submission of the intake form is voluntary. However, without this information, your care team may not be able to complete a full assessment using this portal.

Withdrawal
You may withdraw consent for future use of information collected through this portal by contacting your care team. Withdrawal does not affect processing already performed or records retained as required by law.

Questions
If you have questions about how your data will be used, please speak with your referring clinician before completing the form.`,
};
