import {
  normalizeRating,
  normalizePlayers,
  groupPlayersByRatingDescending,
  computeTeamCapacities,
  distributePlayersAcrossTeamsWithCapacity,
  allocatePlayersToTeams,
} from './teamUtils';
import { PlayerModel } from '../components/Pages/CreateTeamsWorflow/Models/CreateTeamsModels';

describe('teamUtils', () => {
  describe('normalizeRating', () => {
    it('should clamp ratings below 1 to 1', () => {
      expect(normalizeRating(-5)).toBe(1);
      expect(normalizeRating(0.5)).toBe(1);
    });

    it('should clamp ratings above 10 to 10', () => {
      expect(normalizeRating(15)).toBe(10);
      expect(normalizeRating(10.4)).toBe(10); // rounds to 10, within range
    });

    it('should round ratings to nearest integer', () => {
      expect(normalizeRating(5.4)).toBe(5);
      expect(normalizeRating(5.5)).toBe(6);
      expect(normalizeRating(5.6)).toBe(6);
    });
  });

  describe('normalizePlayers', () => {
    it('should remove duplicates (case-insensitive)', () => {
      const players: PlayerModel[] = [
        { name: 'Alice', rating: 5 },
        { name: 'ALICE', rating: 8 }, // duplicate (case-insensitive), last wins
        { name: 'Bob', rating: 3 },
      ];
      const result = normalizePlayers(players);
      expect(result).toHaveLength(2);
      // Last entry ('ALICE', 8) wins, name is normalized 'ALICE'
      const alice = result.find((p) => p.name.toLowerCase() === 'alice');
      expect(alice?.rating).toBe(8);
    });

    it('should normalize ratings to 1-10', () => {
      const players: PlayerModel[] = [
        { name: 'Alice', rating: 15 },
        { name: 'Bob', rating: -2 },
      ];
      const result = normalizePlayers(players);
      expect(result[0].rating).toBe(10);
      expect(result[1].rating).toBe(1);
    });

    it('should trim player names', () => {
      const players: PlayerModel[] = [{ name: '  Charlie  ', rating: 7 }];
      const result = normalizePlayers(players);
      expect(result[0].name).toBe('Charlie');
    });
  });

  describe('groupPlayersByRatingDescending', () => {
    it('should group players by rating in descending order', () => {
      const players: PlayerModel[] = [
        { name: 'Alice', rating: 7 },
        { name: 'Bob', rating: 5 },
        { name: 'Charlie', rating: 7 },
        { name: 'David', rating: 5 },
        { name: 'Eve', rating: 9 },
      ];
      const groups = groupPlayersByRatingDescending(players);
      expect(groups[0][0]).toBe(9); // highest rating first
      expect(groups[1][0]).toBe(7);
      expect(groups[2][0]).toBe(5); // lowest rating last
      expect(groups[0][1]).toHaveLength(1); // 1 player with rating 9
      expect(groups[1][1]).toHaveLength(2); // 2 players with rating 7
      expect(groups[2][1]).toHaveLength(2); // 2 players with rating 5
    });
  });

  describe('computeTeamCapacities', () => {
    it('should compute capacities with even distribution', () => {
      const capacities = computeTeamCapacities(9, 3);
      expect(capacities).toEqual([3, 3, 3]);
    });

    it('should distribute remainder in first teams', () => {
      const capacities = computeTeamCapacities(10, 3);
      expect(capacities).toEqual([4, 3, 3]); // 10 / 3 = 3 base, 1 remainder
      expect(capacities.reduce((a, b) => a + b)).toBe(10); // sum equals players
    });

    it('should have max size difference of 1', () => {
      for (let n = 1; n <= 20; n++) {
        for (let k = 1; k <= n; k++) {
          const capacities = computeTeamCapacities(n, k);
          const maxCap = Math.max(...capacities);
          const minCap = Math.min(...capacities);
          expect(maxCap - minCap).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('allocatePlayersToTeams', () => {
    it('should throw error if team count is 0', () => {
      const players: PlayerModel[] = [{ name: 'Alice', rating: 5 }];
      expect(() => allocatePlayersToTeams(players, 0)).toThrow('Team count must be at least 1');
    });

    it('should throw error if no players', () => {
      expect(() => allocatePlayersToTeams([], 2)).toThrow('No players to allocate');
    });

    it('should throw error if fewer players than teams', () => {
      const players: PlayerModel[] = [{ name: 'Alice', rating: 5 }];
      expect(() => allocatePlayersToTeams(players, 3)).toThrow('Not enough players');
    });

    it('should allocate players to teams with valid capacities', () => {
      const players: PlayerModel[] = [
        { name: 'Alice', rating: 10 },
        { name: 'Bob', rating: 1 },
        { name: 'Charlie', rating: 1 },
        { name: 'David', rating: 1 },
        { name: 'Eve', rating: 1 },
        { name: 'Frank', rating: 1 },
        { name: 'Grace', rating: 1 },
        { name: 'Henry', rating: 1 },
        { name: 'Iris', rating: 1 },
        { name: 'Jack', rating: 1 },
      ];
      const teams = allocatePlayersToTeams(players, 2);
      expect(teams).toHaveLength(2);

      // Check team sizes differ by at most 1
      const sizes = teams.map((t) => t.players.length);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);

      // Check all players assigned
      const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);
      expect(totalPlayers).toBe(10);

      // Check total ratings are available and reasonable
      const totalRatings = teams.map((t) => t.totalRating);
      expect(totalRatings[0] + totalRatings[1]).toBe(10 + 9 * 1); // 1 player at 10, 9 at 1
    });

    it('should balance teams with mixed ratings (Example 1)', () => {
      // Setup: N=7, K=3, ratings = [9, 5, 5, 1, 1, 1, 1]
      // Capacities: [3, 2, 2]
      const players: PlayerModel[] = [
        { name: 'A', rating: 9 },
        { name: 'B', rating: 5 },
        { name: 'C', rating: 5 },
        { name: 'D', rating: 1 },
        { name: 'E', rating: 1 },
        { name: 'F', rating: 1 },
        { name: 'G', rating: 1 },
      ];
      const teams = allocatePlayersToTeams(players, 3);

      // Check team sizes
      const sizes = teams.map((t) => t.players.length);
      sizes.sort((a, b) => a - b);
      expect(sizes).toEqual([2, 2, 3]); // Capacities: 1 team with 3, 2 teams with 2

      // Check all players assigned
      const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);
      expect(totalPlayers).toBe(7);

      // Check total rating distribution is reasonable
      const totalRatings = teams.map((t) => t.totalRating).sort((a, b) => a - b);
      const minRating = totalRatings[0];
      const maxRating = totalRatings[2];
      expect(maxRating - minRating).toBeLessThanOrEqual(8); // rough check, not strict
    });

    it('should handle pathological case (1 high + many low ratings)', () => {
      // Setup: 1 player at 10, 9 players at 1, 2 teams
      // Expected: [5, 5] players, rating imbalance expected but sizes fair
      const players: PlayerModel[] = [
        { name: 'SuperStar', rating: 10 },
        ...Array.from({ length: 9 }, (_, i) => ({
          name: `Player${i}`,
          rating: 1,
        })),
      ];

      const teams = allocatePlayersToTeams(players, 2);

      // Check team sizes are equal or differ by 1
      const sizes = teams.map((t) => t.players.length);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
      expect(sizes.sort()).toEqual([5, 5]); // 10 players / 2 = 5 each

      // One team has superstar (10) + 4 low players = 14, other has 5 low players = 5
      const totalRatings = teams.map((t) => t.totalRating).sort((a, b) => a - b);
      expect(totalRatings).toEqual([5, 14]); // [lower total, higher total]
    });

    it('should ensure all team sizes are within capacity bounds', () => {
      for (let playerCount = 5; playerCount <= 20; playerCount++) {
        for (let teamCount = 2; teamCount <= Math.min(playerCount, 5); teamCount++) {
          const players: PlayerModel[] = Array.from({ length: playerCount }, (_, i) => ({
            name: `Player${i}`,
            rating: Math.floor(Math.random() * 10) + 1,
          }));

          const teams = allocatePlayersToTeams(players, teamCount);
          const sizes = teams.map((t) => t.players.length);

          // Check all sizes are within capacity
          const capacities = computeTeamCapacities(playerCount, teamCount);
          sizes.forEach((size, idx) => {
            expect(size).toBeLessThanOrEqual(Math.max(...capacities));
            expect(size).toBeGreaterThanOrEqual(Math.min(...capacities));
          });

          // Check sizes differ by at most 1
          expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);

          // Check all players assigned
          expect(sizes.reduce((a, b) => a + b)).toBe(playerCount);
        }
      }
    });
  });
});
