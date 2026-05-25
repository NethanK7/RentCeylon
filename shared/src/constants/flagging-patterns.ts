export const FLAGGING_PATTERNS = [
  /(\+94|0094|0)7[0-9]{8}/g,
  /(\+94|0094|0)[1-9][0-9]{8}/g,
  /whatsapp\.com|wa\.me/gi,
  /payhere\.lk|ipay\.lk/gi,
  /bank\s*transfer|direct\s*pay|off.?platform/gi,
  /[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}\s*[0-9]{4}/g,
] as const;

export function containsFlaggedContent(text: string): boolean {
  return FLAGGING_PATTERNS.some((pattern) => pattern.test(text));
}
