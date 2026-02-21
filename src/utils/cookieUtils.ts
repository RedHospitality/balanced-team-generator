export interface PlayerData {
  players: {
    name: string;
    rating: number;
  }[];
  importType: 'Manual' | 'Dynamic Insert' | 'Spreadsheet';
  importUrl?: string; // For spreadsheet imports
}

const COOKIE_NAME = 'balancedTeamPlayerData';
const COOKIE_EXPIRY_DAYS = 30;

/**
 * Set a cookie with the given name, value, and expiry days
 */
function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * Delete a cookie by name
 */
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Store player data in cookies
 */
export function storePlayerData(playerData: PlayerData) {
  try {
    const dataString = JSON.stringify(playerData);
    setCookie(COOKIE_NAME, dataString, COOKIE_EXPIRY_DAYS);
  } catch (error) {
    console.error('Error storing player data in cookies:', error);
  }
}

/**
 * Retrieve player data from cookies
 */
export function getPlayerData(): PlayerData | null {
  try {
    const dataString = getCookie(COOKIE_NAME);
    if (dataString) {
      return JSON.parse(dataString);
    }
  } catch (error) {
    console.error('Error retrieving player data from cookies:', error);
  }
  return null;
}

/**
 * Clear player data from cookies
 */
export function clearPlayerData() {
  deleteCookie(COOKIE_NAME);
}