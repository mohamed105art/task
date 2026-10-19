/**
 * Arabic & Multilingual Text Normalization and Token Matching Utility
 * Designed specifically for Moroccan judicial, administrative, and technical records.
 */

/**
 * Normalizes Arabic text by unifying variant characters (alefs, taa marbuta, yaa)
 * and stripping diacritics (tashkeel) and tatweel for tolerant matching.
 */
export function normalizeArabicText(str?: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics (harakat/tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize Alef variants: أ, إ, آ -> ا
    .replace(/[أإآ]/g, 'ا')
    // Normalize Taa Marbuta: ة -> ه
    .replace(/ة/g, 'ه')
    // Normalize Alef Maksura: ى -> ي
    .replace(/ى/g, 'ي')
    // Normalize Persian/Urdu variants if present
    .replace(/ك/g, 'ك')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

/**
 * Checks if search tokens match the target text using normalized fuzzy tokens.
 */
export function matchNormalizedTokens(target: string, queryTokens: string[]): boolean {
  if (!target || queryTokens.length === 0) return false;
  const normalizedTarget = normalizeArabicText(target);
  return queryTokens.every(token => normalizedTarget.includes(token));
}

/**
 * Tokenizes a search query into clean normalized words.
 */
export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeArabicText(query);
  return normalized
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}
