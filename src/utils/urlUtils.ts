/**
 * Extracts the Spreadsheet ID and converts it to a CSV export URL.
 * Handles all Google Sheets link variations:
 * - Desktop edit: https://docs.google.com/spreadsheets/d/{ID}/edit#gid=0
 * - Share link: https://docs.google.com/spreadsheets/d/{ID}/view?usp=sharing
 * - Mobile app: https://docs.google.com/spreadsheets/d/{ID}/view?usp=drivesdk
 * - Specific tab: https://docs.google.com/spreadsheets/d/{ID}/edit#gid=123
 * - Just the ID: {ID}
 * 
 * The Spreadsheet ID is the only part that never changes - it's always between /d/ and the next /
 * OR it can be pasted directly as just the ID itself.
 * 
 * @param inputUrl Any Google Sheets URL format or just the spreadsheet ID
 * @returns CSV export URL, or null if ID cannot be extracted
 */
export const getCsvExportUrl = (inputUrl: string): string | null => {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return null;
  }

  const trimmedInput = inputUrl.trim();

  // Pattern 1: Try to extract from a full URL - looks for /d/{ID}
  const urlIdPattern = /\/d\/([a-zA-Z0-9-_]+)/;
  const urlMatch = trimmedInput.match(urlIdPattern);

  if (urlMatch && urlMatch[1]) {
    const spreadsheetId = urlMatch[1];
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
  }

  // Pattern 2: Check if the input itself is just the ID (usually 44+ characters of alphanumeric, hyphens, underscores)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmedInput)) {
    return `https://docs.google.com/spreadsheets/d/${trimmedInput}/export?format=csv`;
  }

  return null;
};

/**
 * Validates the CSV export URL and provides user-friendly error messages.
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

  const csvUrl = getCsvExportUrl(rawUrl.trim());

  if (!csvUrl) {
    return {
      error:
        'Invalid URL format. Please provide a Google Sheets URL in any of these formats:\n' +
        '• Share link: https://docs.google.com/spreadsheets/d/1abc...xyz/view?usp=sharing\n' +
        '• Edit link: https://docs.google.com/spreadsheets/d/1abc...xyz/edit\n' +
        '• With sheet tab: https://docs.google.com/spreadsheets/d/1abc...xyz/edit#gid=2\n' +
        '• Mobile link: https://docs.google.com/spreadsheets/d/1abc...xyz/view?usp=drivesdk\n\n' +
        'Make sure the sheet is set to "Anyone with the link can view"',
    };
  }

  return { url: csvUrl };
}

/**
 * Legacy function for backwards compatibility - redirects to getCsvExportUrl
 */
export function normalizeGoogleSheetsUrl(inputUrl: string): string | null {
  return getCsvExportUrl(inputUrl);
}
