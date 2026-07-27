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
  it('authenticates a demo account', async () => {
    await expect(authenticateUser('ada@example.com', 'Password1')).resolves.toMatchObject({
      username: 'ada@example.com',
    });
  });

  it('rejects sign up in demo mode', async () => {
    await expect(createUserAccount()).rejects.toThrow('Sign up is temporarily disabled');
  });

  it('persists the active user and their players data', async () => {
    const account = await authenticateUser('grace@example.com', 'Password2');
    expect(account).not.toBeNull();
    if (!account) {
      return;
    }

    saveActiveUser(account.id);
    await saveUserPlayers(account.id, {
      players: [{ name: 'Grace', rating: 9 }],
      importType: 'Manual',
    });

    await expect(getActiveUser()).resolves.toMatchObject({ id: account.id });
    await expect(getUserPlayers(account.id)).resolves.toMatchObject({ players: [{ name: 'Grace', rating: 9 }] });

    clearActiveUser();
    await expect(getActiveUser()).resolves.toBeNull();
  });

  it('seeds the demo temp profile with the mock players', async () => {
    const tempUser = await authenticateUser('temp', 'temp');

    expect(tempUser?.id).toBe('temp');
    expect(tempUser?.username).toBe('temp');
    await expect(getUserPlayers('temp')).resolves.toMatchObject({ players: PlayerList });
  });
});
