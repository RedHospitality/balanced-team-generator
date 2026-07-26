import { PlayerModel } from '../components/Pages/CreateTeamsWorflow/Models/CreateTeamsModels';
import { PlayerList } from '../mocks/PlayerMock';
import profileIndex from '../profiles/index.json';
import tempProfile from '../profiles/temp.json';

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
  email: string;
  password: string;
  dataFile: string;
  createdAt: string;
}

interface UserStoreState {
  users: StoredUserAccount[];
  files: Record<string, PlayerData>;
}

interface RepoProfileEntry {
  username: string;
  password: string;
  profileData: string;
}

interface RepoProfileIndex {
  [userId: string]: RepoProfileEntry;
}

const USER_STORE_KEY = 'balancedTeamGenerator.userStore';
const ACTIVE_USER_KEY = 'balancedTeamGenerator.activeUser';
const TEMP_USER_ID = 'temp';
const TEMP_USER_EMAIL = 'temp';
const TEMP_USER_PASSWORD = 'temp';
const PROFILE_INDEX_PATH = 'src/profiles/index.json';
const PROFILE_INDEX_STORE_KEY = 'balancedTeamGenerator.profileIndex';
const PROFILE_DATA_STORE_PREFIX = 'balancedTeamGenerator.profile:';

let repoProfileIndex: RepoProfileIndex = (process.env.NODE_ENV === 'test' ? {} : profileIndex) as RepoProfileIndex;

function isNodeRuntime() {
  return typeof window === 'undefined' && typeof process !== 'undefined' && Boolean(process.versions?.node);
}

function loadNodeFsModule() {
  if (!isNodeRuntime()) {
    return null;
  }

  try {
    // eslint-disable-next-line no-new-func
    return Function('return require')()('fs');
  } catch (error) {
    console.error('Unable to load fs module', error);
    return null;
  }
}

function buildProfileIndexFromRepo(): RepoProfileIndex {
  if (typeof window !== 'undefined') {
    const storedIndex = window.localStorage.getItem(PROFILE_INDEX_STORE_KEY);
    if (storedIndex) {
      try {
        return JSON.parse(storedIndex) as RepoProfileIndex;
      } catch (error) {
        console.error('Unable to parse stored profile index', error);
      }
    }
  }

  return repoProfileIndex;
}

function writeProfileIndexToRepo(index: RepoProfileIndex) {
  repoProfileIndex = index;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PROFILE_INDEX_STORE_KEY, JSON.stringify(index));
    return;
  }

  try {
    const fs = loadNodeFsModule();
    if (fs) {
      fs.writeFileSync(PROFILE_INDEX_PATH, JSON.stringify(index, null, 2));
    }
  } catch (error) {
    console.error('Unable to write profile index file', error);
  }
}

function createProfileFile(userId: string, username: string, password: string) {
  const profilePath = `src/profiles/${userId}.json`;
  const profileData = {
    username,
    password,
    profileData: `/profiles/${userId}.json`,
    sports: {},
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`${PROFILE_DATA_STORE_PREFIX}${userId}`, JSON.stringify(profileData));
    return;
  }

  try {
    const fs = loadNodeFsModule();
    if (fs) {
      fs.writeFileSync(profilePath, JSON.stringify(profileData, null, 2));
    }
  } catch (error) {
    console.error('Unable to write profile file', error);
  }
}

function parseProfilePlayers(profile: typeof tempProfile): PlayerModel[] {
  const volleyball = profile?.sports?.Volleyball;

  if (volleyball && typeof volleyball === 'object') {
    return Object.entries(volleyball).map(([name, data]) => ({
      name,
      rating: Number((data as { rating?: number }).rating ?? 0),
    }));
  }

  return PlayerList;
}

function ensureTempUser(state: UserStoreState): UserStoreState {
  const existingTempUser = state.users.find((user) => user.id === TEMP_USER_ID);
  if (existingTempUser) {
    state.files[existingTempUser.dataFile] = state.files[existingTempUser.dataFile] ?? {
      players: PlayerList,
      importType: 'Manual',
    };
    return state;
  }

  const tempUser: StoredUserAccount = {
    id: TEMP_USER_ID,
    firstName: 'Temp',
    lastName: 'User',
    username: TEMP_USER_EMAIL,
    email: TEMP_USER_EMAIL,
    password: TEMP_USER_PASSWORD,
    dataFile: 'temp.json',
    createdAt: new Date().toISOString(),
  };

  state.users = [tempUser, ...state.users];
  state.files[tempUser.dataFile] = {
    players: PlayerList,
    importType: 'Manual',
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(USER_STORE_KEY, JSON.stringify(state));
  }

  return state;
}

function readStoreState(): UserStoreState {
  const repoIndex = buildProfileIndexFromRepo();
  const seededUsers = Object.entries(repoIndex).map(([id, entry]) => ({
    id,
    firstName: entry.username,
    lastName: 'User',
    username: entry.username,
    email: entry.username,
    password: entry.password,
    dataFile: entry.profileData.replace('/profiles/', ''),
    createdAt: new Date().toISOString(),
  }));

  const seedFiles = {
    'temp.json': {
      players: parseProfilePlayers(tempProfile),
      importType: 'Manual' as const,
    },
  };

  const repoState = {
    users: seededUsers,
    files: seedFiles,
  };

  if (typeof window === 'undefined') {
    return ensureTempUser(repoState);
  }

  try {
    const raw = window.localStorage.getItem(USER_STORE_KEY);
    if (!raw) {
      return ensureTempUser(repoState);
    }

    const persistedState = JSON.parse(raw) as UserStoreState;
    const mergedUsersById = new Map<string, StoredUserAccount>();
    repoState.users.forEach((user) => mergedUsersById.set(user.id, user));
    (persistedState.users ?? []).forEach((user) => mergedUsersById.set(user.id, user));

    const mergedFiles = {
      ...seedFiles,
      ...(persistedState.files ?? {}),
    };

    return ensureTempUser({
      users: Array.from(mergedUsersById.values()),
      files: mergedFiles,
    });
  } catch (error) {
    console.error('Unable to read user store state', error);
    return ensureTempUser(repoState);
  }
}

function writeStoreState(state: UserStoreState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(USER_STORE_KEY, JSON.stringify(state));
}

function getUserState(): UserStoreState {
  return readStoreState();
}

function getUserByEmail(email: string) {
  const state = getUserState();
  return state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

function getUserByIdentifier(identifier: string) {
  const state = getUserState();
  const normalizedIdentifier = identifier.toLowerCase();

  return state.users.find((user) => {
    const usernameMatch = user.username?.toLowerCase() === normalizedIdentifier;
    const emailMatch = user.email?.toLowerCase() === normalizedIdentifier;
    return usernameMatch || emailMatch;
  }) ?? null;
}

function getUserById(userId: string) {
  const state = getUserState();
  return state.users.find((user) => user.id === userId) ?? null;
}

export function createUserAccount(account: Omit<StoredUserAccount, 'id' | 'dataFile' | 'createdAt'>) {
  const state = getUserState();

  if (getUserByEmail(account.email)) {
    throw new Error('An account already exists for this email address.');
  }

  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const dataFile = `${userId}.json`;
  const newUser: StoredUserAccount = {
    ...account,
    username: account.email,
    id: userId,
    dataFile,
    createdAt: new Date().toISOString(),
  };

  state.users = [...state.users, newUser];
  state.files[dataFile] = {
    players: [],
    importType: 'Manual',
  };

  const newProfileEntry: RepoProfileEntry = {
    username: account.email,
    password: account.password,
    profileData: `/profiles/${dataFile}`,
  };

  const nextIndex = {
    ...buildProfileIndexFromRepo(),
    [userId]: newProfileEntry,
  };

  writeProfileIndexToRepo(nextIndex);
  createProfileFile(userId, account.email, account.password);
  writeStoreState(state);

  return newUser;
}

export function authenticateUser(username: string, password: string) {
  const user = getUserByIdentifier(username);

  if (!user || user.password !== password) {
    return null;
  }

  return user;
}

export function saveActiveUser(userId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export function getActiveUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const userId = window.localStorage.getItem(ACTIVE_USER_KEY);
  if (!userId) {
    return null;
  }

  return getUserById(userId);
}

export function clearActiveUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACTIVE_USER_KEY);
  window.localStorage.removeItem(USER_STORE_KEY);
  window.localStorage.removeItem(PROFILE_INDEX_STORE_KEY);

  const profileKeys = Object.keys(window.localStorage).filter((key) => key.startsWith(PROFILE_DATA_STORE_PREFIX));
  profileKeys.forEach((key) => window.localStorage.removeItem(key));
}

export function saveUserPlayers(userId: string, playerData: PlayerData) {
  const state = getUserState();
  const user = getUserById(userId);

  if (!user) {
    return;
  }

  state.files[user.dataFile] = playerData;
  writeStoreState(state);
}

export function getUserPlayers(userId: string) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  return getUserState().files[user.dataFile] ?? null;
}

export function clearUserPlayers(userId: string) {
  const state = getUserState();
  const user = getUserById(userId);

  if (!user) {
    return;
  }

  state.files[user.dataFile] = {
    players: [],
    importType: 'Manual',
  };
  writeStoreState(state);
}
