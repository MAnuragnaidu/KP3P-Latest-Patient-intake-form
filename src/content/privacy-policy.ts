import type { LegalDocument } from './legal-document';

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  version: '1.0',
  body: `Privacy Policy — MyGastro AI
This Privacy Policy explains how MyGastro AI ("we", "us", "our"), operated under Mygastro.ai collects, uses, stores, and protects your personal and health information when you use our platform (the "admin" clinical dashboard and the "Patient Intake" application, together the "Platform"), in accordance with the Digital Personal Data Protection Act, 2025 ("DPDP Act") and applicable Indian law.

1. Who This Applies To
This Policy applies to:
•	Patients submitting information via the Patient Intake Form
•	Clinicians and staff using the Admin Dashboard
•	Any other individual whose personal data is processed through the Platform
2. Information We Collect
2.1 Information you provide directly
•	Contact details: name, phone number, email address
•	Demographic information: age, gender, date of birth
•	Medical history and current symptoms relevant to IBD (Inflammatory Bowel Disease)
•	Clinical assessment data entered by your treating clinician (e.g. SES-CD, Harvey-Bradshaw Index, Partial Mayo Score, endoscopic scoring, infection screening, medications, comorbidities, vaccination history)
•	Documents you or your clinician upload (e.g. reports, scans)
2.2 Information collected automatically
•	Login and session information (for Admin Dashboard users)
•	Basic technical logs (timestamps, IP address, device/browser type) for security and troubleshooting
We do not knowingly collect more information than is necessary for the purposes described in Section 3 (data minimization).
3. Why We Collect Your Information (Purpose)
We process your personal and health data only for the following purposes:
1.	Clinical care — to allow your treating clinician to assess your condition, record clinical findings, and plan your care
2.	Care sheet generation — to generate a KP-3P care sheet summarizing your assessment, using AI tools (Google Gemini or Anthropic Claude) that process your clinical data to produce this document
3.	Record-keeping — to maintain accurate medical records as required for continuity of care and applicable healthcare regulations
4.	Platform security and support — to secure accounts, prevent misuse, and troubleshoot technical issues
We do not use your information for marketing, advertising, or sale to third parties. Any use beyond what is listed above will only occur with your separate, specific consent.

4. Legal Basis for Processing
We process your data based on:
•	Your consent, given via the consent checkbox before you submit information through the Patient Intake Form
•	Where applicable, the exemption available to registered healthcare professionals and clinical establishments under the DPDP Act for processing strictly necessary to provide health services
You may withdraw your consent at any time (see Section 8). Withdrawal does not affect the lawfulness of processing carried out before withdrawal, and may affect our ability to continue providing you clinical care through the Platform.
5. Who Can Access Your Information
Access to your data is restricted to:
•	Your treating clinician and authorized administrative staff
•	Service providers who process data on our behalf strictly to operate the Platform:
•	Supabase — database hosting and authentication (data stored in [REGION])
•	Google Cloud Platform — application hosting (Cloud Run, asia-south1/Mumbai)
•	Google Gemini and/or Anthropic Claude — AI providers used to generate care sheets from clinical data you and your clinician provide
6. Where and How Long We Store Your Information
•	Your data is stored on servers located in [REGION/COUNTRY — confirm Supabase project region]
•	We retain your data for as long as necessary to provide clinical care and to comply with applicable medical record-keeping laws in India
•	After this period, data is securely deleted or anonymized, unless a longer retention period is required by law
7. Security Measures
We apply reasonable technical and organizational safeguards, including:
•	Encrypted data transmission (HTTPS/TLS)
•	Row-Level Security (RLS) restricting database access by role
•	Restricted, authenticated access to the Admin Dashboard
•	Secrets and API keys managed via Google Secret Manager (not stored in application code)
No system is completely secure, and we cannot guarantee absolute security, but we take reasonable steps consistent with industry practice to protect your data.
8. Your Rights
Under the DPDP Act, you have the right to:
•	Access — request a copy of the personal data we hold about you
•	Correction — request correction of inaccurate or incomplete data
•	Erasure — request deletion of your data, subject to our legal obligation to retain medical records for a minimum period
•	Withdraw consent — withdraw consent for processing at any time
•	Grievance redressal — raise a complaint about how your data is handled
`,
};
