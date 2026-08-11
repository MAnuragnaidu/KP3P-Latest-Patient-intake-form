export type LegalDocument = {
  title: string;
  version: string;
  body: string;
};

export function legalDocumentParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
