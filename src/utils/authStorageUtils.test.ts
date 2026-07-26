import {
  authenticateUser,
  createUserAccount,
  getActiveUser,
  getUserPlayers,
  saveActiveUser,
  saveUserPlayers,
  clearActiveUser,
} from './authStorageUtils';
import { PlayerList } from '../mocks/PlayerMock';

beforeEach(() => {
  window.localStorage.clear();
});

describe('authStorageUtils', () => {
  it('creates a user account and authenticates it', () => {
    const account = createUserAccount({
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'ada@example.com',
      email: 'ada@example.com',
      password: 'Password1',
    });

    expect(account.email).toBe('ada@example.com');
    expect(authenticateUser('ada@example.com', 'Password1')).toMatchObject({
      email: 'ada@example.com',
    });
  });

  it('persists the active user and their players data', () => {
    const account = createUserAccount({
      firstName: 'Grace',
      lastName: 'Hopper',
      username: 'grace@example.com',
      email: 'grace@example.com',
      password: 'Password2',
    });

    saveActiveUser(account.id);
    saveUserPlayers(account.id, {
      players: [{ name: 'Grace', rating: 9 }],
      importType: 'Manual',
    });

    expect(getActiveUser()?.id).toBe(account.id);
    expect(getUserPlayers(account.id)?.players).toHaveLength(1);

    clearActiveUser();
    expect(getActiveUser()).toBeNull();
  });

  it('writes a profile index entry for new sign-ups', () => {
    const account = createUserAccount({
      firstName: 'Margaret',
      lastName: 'Hamilton',
      username: 'margaret@example.com',
      email: 'margaret@example.com',
      password: 'Password3',
    });

    const storedIndex = window.localStorage.getItem('balancedTeamGenerator.profileIndex');
    expect(storedIndex).toContain(account.id);
    expect(storedIndex).toContain('margaret@example.com');
  });

  it('seed the demo temp profile with the mock players', () => {
    const tempUser = authenticateUser('temp', 'temp');

    expect(tempUser?.id).toBe('temp');
    expect(tempUser?.email).toBe('temp');
    expect(getUserPlayers('temp')?.players).toEqual(PlayerList);
  });
});
