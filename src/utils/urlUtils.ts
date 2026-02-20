/**
 * Extracts spreadsheet ID from various Google Sheets URL formats.
 * Handles:
 * - Standard edit URL: https://docs.google.com/spreadsheets/d/{ID}/edit...
 * - Share URL: https://docs.google.com/spreadsheets/d/{ID}/...
 * - Shortened/direct URLs with ID in path
 *
 * @param url Raw URL string (any format)
 * @returns Spreadsheet ID or null if not found
 */
export function extractSpreadsheetId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Pattern 1: Standard Google Sheets URL with /d/{ID}/
  const standardMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (standardMatch && standardMatch[1]) {
    return standardMatch[1];
  }

  // Pattern 2: Just the ID (already extracted)
  if (/^[a-zA-Z0-9-_]{44}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

/**
 * Extracts sheet GID (sheet tab ID) from URL or query parameters.
 * GID is the sheet tab identifier, default is 0 for the first sheet.
 * Handles:
 * - Query param: ?gid={GID}
 * - URL fragment: #gid={GID}
 *
 * @param url URL string
 * @returns Sheet GID (defaults to 0 if not found)
 */
export function extractSheetGid(url: string): number {
  if (!url || typeof url !== 'string') {
    return 0;
  }

  // Check query parameters: ?gid=123
  const queryMatch = url.match(/[?&]gid=(\d+)/);
  if (queryMatch && queryMatch[1]) {
    return parseInt(queryMatch[1], 10);
  }

  // Check URL fragment: #gid=123
  const fragmentMatch = url.match(/#.*gid=(\d+)/);
  if (fragmentMatch && fragmentMatch[1]) {
    return parseInt(fragmentMatch[1], 10);
  }

  return 0; // Default to first sheet
}

/**
 * Validates if the extracted ID looks like a valid Google Sheets ID.
 * Google Sheets IDs are typically 44 characters long.
 *
 * @param spreadsheetId ID to validate
 * @returns true if ID appears valid
 */
export function isValidSpreadsheetId(spreadsheetId: string): boolean {
  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    return false;
  }
  // Google Sheets IDs are alphanumeric with hyphens/underscores, typically 44 chars
  return /^[a-zA-Z0-9-_]{20,}$/.test(spreadsheetId);
}

/**
 * Converts any Google Sheets URL format to the standard CSV export format.
 * This is the URL format that can be directly fetched by the browser.
 *
 * Input examples:
 * - https://docs.google.com/spreadsheets/d/{ID}/edit#gid=0
 * - https://docs.google.com/spreadsheets/d/{ID}/edit?usp=sharing
 * - {SPREADSHEET_ID}
 *
 * Output: https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}
 *
 * @param anyUrlFormat URL in any recognized format
 * @returns Properly formatted CSV export URL, or null if ID cannot be extracted
 */
export function normalizeGoogleSheetsUrl(anyUrlFormat: string): string | null {
  if (!anyUrlFormat) {
    return null;
  }

  // Extract spreadsheet ID
  const spreadsheetId = extractSpreadsheetId(anyUrlFormat.trim());
  if (!spreadsheetId || !isValidSpreadsheetId(spreadsheetId)) {
    return null;
  }

  // Extract sheet GID (defaults to 0)
  const gid = extractSheetGid(anyUrlFormat);

  // Construct standard CSV export URL
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}

/**
 * Attempts to normalize a URL and provides user-friendly error messages.
 * Returns normalized URL or an error message.
 *
 * @param rawUrl URL provided by user
 * @returns Object with either `url` (success) or `error` (failure) property
 */
export function normalizeUrlWithError(
  rawUrl: string
): { url: string } | { error: string } {
  if (!rawUrl || rawUrl.trim() === '') {
    return { error: 'URL cannot be empty' };
  }

  const normalized = normalizeGoogleSheetsUrl(rawUrl);

  if (!normalized) {
    return {
      error:
        'Could not extract valid spreadsheet ID. Please check the URL format. ' +
        'Example: https://docs.google.com/spreadsheets/d/1abc...xyz/edit',
    };
  }

  return { url: normalized };
}
