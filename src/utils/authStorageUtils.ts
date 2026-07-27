import { PlayerModel } from '../components/Pages/CreateTeamsWorflow/Models/CreateTeamsModels';
import { PlayerList } from '../mocks/PlayerMock';

export interface PlayerData {
  players: PlayerModel[];
  importType: 'Manual' | 'Dynamic Insert' | 'Spreadsheet';
  importUrl?: string;
}

export interface StoredUserAccount {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  dataFile: string;
  createdAt: string;
}

const ACTIVE_USER_KEY = 'balancedTeamGenerator.activeUser';
const PLAYER_DATA_PREFIX = 'balancedTeamGenerator.players:';

interface MockUserAccount extends StoredUserAccount {
  password: string;
}

const MOCK_USERS: MockUserAccount[] = [
  {
    id: 'temp',
    firstName: 'Temp',
    lastName: 'User',
    username: 'temp',
    password: 'temp',
    dataFile: 'temp.json',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-ada',
    firstName: 'Ada',
    lastName: 'Lovelace',
    username: 'ada@example.com',
    password: 'Password1',
    dataFile: 'user-ada.json',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-grace',
    firstName: 'Grace',
    lastName: 'Hopper',
    username: 'grace@example.com',
    password: 'Password2',
    dataFile: 'user-grace.json',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-margaret',
    firstName: 'Margaret',
    lastName: 'Hamilton',
    username: 'margaret@example.com',
    password: 'Password3',
    dataFile: 'user-margaret.json',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const DEFAULT_PLAYERS_BY_USER: Record<string, PlayerData> = {
  temp: {
    players: PlayerList,
    importType: 'Manual',
  },
};

function getMockUserById(userId: string) {
  return MOCK_USERS.find((user) => user.id === userId) ?? null;
}

function stripPassword(user: MockUserAccount): StoredUserAccount {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    dataFile: user.dataFile,
    createdAt: user.createdAt,
  };
}

function readStoredPlayers(userId: string): PlayerData | null {
  if (typeof window === 'undefined') {
    return DEFAULT_PLAYERS_BY_USER[userId] ?? null;
  }

  const raw = window.localStorage.getItem(`${PLAYER_DATA_PREFIX}${userId}`);
  if (!raw) {
    return DEFAULT_PLAYERS_BY_USER[userId] ?? null;
  }

  try {
    return JSON.parse(raw) as PlayerData;
  } catch (error) {
    console.error('Unable to parse stored players', error);
    return DEFAULT_PLAYERS_BY_USER[userId] ?? null;
  }
}

export async function createUserAccount() {
  throw new Error('Sign up is temporarily disabled. Please use one of the demo accounts.');
}

export async function authenticateUser(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const user = MOCK_USERS.find((candidate) => (
    candidate.username.toLowerCase() === normalizedUsername
    && candidate.password === password
  ));

  return user ? stripPassword(user) : null;
}

export function saveActiveUser(userId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export async function getActiveUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const userId = window.localStorage.getItem(ACTIVE_USER_KEY);
  if (!userId) {
    return null;
  }

  const user = getMockUserById(userId);
  return user ? stripPassword(user) : null;
}

export function clearActiveUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACTIVE_USER_KEY);
}

export async function saveUserPlayers(userId: string, playerData: PlayerData) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${PLAYER_DATA_PREFIX}${userId}`, JSON.stringify(playerData));
}

export async function getUserPlayers(userId: string) {
  return readStoredPlayers(userId);
}

export async function clearUserPlayers(userId: string) {
  await saveUserPlayers(userId, {
    players: [],
    importType: 'Manual',
  });
}
