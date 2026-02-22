import { PlayerModel, TeamModel } from '../components/Pages/CreateTeamsWorflow/Models/CreateTeamsModels';

/**
 * Rounds a rating to the nearest whole number between 1-10.
 * Clamps values outside the range to min(1) or max(10).
 *
 * @param rating Raw numeric rating
 * @returns Rounded rating (1-10 whole number)
 */
export function normalizeRating(rating: number): number {
  const rounded = Math.round(rating);
  return Math.max(1, Math.min(10, rounded));
}

/**
 * Deduplicates players by name (case-insensitive).
 * When duplicates exist, the last occurrence's rating is retained.
 * Also trims names, normalizes ratings to 1-10 whole numbers, and validates inputs.
 *
 * @param players Array of players, potentially with duplicates
 * @returns Deduplicated and normalized player array
 */
export function normalizePlayers(players: PlayerModel[]): PlayerModel[] {
  const playerMap = new Map<string, PlayerModel>();

  players.forEach((player) => {
    const normalizedName = player.name.trim();
    const rating = parseFloat(String(player.rating));

    // Validate: must have non-empty name and valid numeric rating
    if (normalizedName && !isNaN(rating)) {
      // Use lowercase key for case-insensitive dedup
      const key = normalizedName.toLowerCase();
      playerMap.set(key, { name: normalizedName, rating: normalizeRating(rating) });
    }
  });

  return Array.from(playerMap.values());
}

/**
 * Groups players by their rating into a map where key is rating and value is array of players.
 * Ratings are sorted in descending order (highest first).
 *
 * @param players Array of normalized players
 * @returns Sorted array of [rating, players[]] tuples in descending order by rating
 */
export function groupPlayersByRatingDescending(
  players: PlayerModel[]
): Array<[number, PlayerModel[]]> {
  const groups = new Map<number, PlayerModel[]>();

  // Group players by rating
  players.forEach((player) => {
    const rating = player.rating;
    if (!groups.has(rating)) {
      groups.set(rating, []);
    }
    groups.get(rating)!.push(player);
  });

  // Sort ratings in descending order and return as array of tuples
  return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * Mutates the original array.
 *
 * @param array Array to shuffle
 * @returns The shuffled array (same reference)
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Finds the index of the team with the smallest total rating.
 *
 * @param totalRatings Array of total ratings for each team
 * @returns Index of the team with the smallest total rating
 */
export function findSmallestTeamIndex(totalRatings: number[]): number {
  let smallestIndex = 0;
  let smallestRating = totalRatings[0];

  for (let i = 1; i < totalRatings.length; i++) {
    if (totalRatings[i] < smallestRating) {
      smallestIndex = i;
      smallestRating = totalRatings[i];
    }
  }

  return smallestIndex;
}

/**
 * Assigns a single player to the team with the smallest total rating.
 * Updates both the team roster and total ratings array.
 *
 * @param player Player object with name and rating
 * @param teams Array of player arrays for each team
 * @param totalRatings Array of cumulative ratings for each team
 */
export function assignPlayerToLightestTeam(
  player: PlayerModel,
  teams: PlayerModel[][],
  totalRatings: number[]
): void {
  const teamIndex = findSmallestTeamIndex(totalRatings);
  teams[teamIndex].push(player);
  totalRatings[teamIndex] += player.rating;
}

/**
 * Computes team capacities based on number of players and teams.
 * Distributes players as evenly as possible, with remainder going to first teams.
 *
 * @param playerCount Total number of players
 * @param teamCount Number of teams
 * @returns Array of capacities (one per team)
 */
export function computeTeamCapacities(playerCount: number, teamCount: number): number[] {
  const baseCapacity = Math.floor(playerCount / teamCount);
  const remainder = playerCount % teamCount;

  return Array.from({ length: teamCount }, (_, i) => (i < remainder ? baseCapacity + 1 : baseCapacity));
}

/**
 * Distributes players across teams using hybrid greedy algorithm with capacity constraints.
 * - Maintains both totalRating and totalPlayers per team
 * - Assigns highest-rated available player to the team with smallest total rating (that still has capacity)
 * - Removes teams from active list once they reach capacity (soft-removal)
 * - Guarantees all teams have size difference ≤ 1
 *
 * @param ratingGroups Sorted array of [rating, players[]] tuples (descending)
 * @param teamCount Number of teams
 * @returns Array of teams, each containing PlayerModel objects
 */
export function distributePlayersAcrossTeamsWithCapacity(
  ratingGroups: Array<[number, PlayerModel[]]>,
  teamCount: number
): PlayerModel[][] {
  // Compute capacities: base + remainder distributed
  const capacities = computeTeamCapacities(
    ratingGroups.reduce((sum, [_, players]) => sum + players.length, 0),
    teamCount
  );

  const teams: PlayerModel[][] = Array.from({ length: teamCount }, () => []);
  const totalRatings: number[] = Array.from({ length: teamCount }, () => 0);
  const activeTeams = new Set<number>(Array.from({ length: teamCount }, (_, i) => i));

  // Iterate through each rating group (highest first due to descending sort)
  ratingGroups.forEach(([rating, players]) => {
    // Shuffle players within this rating group for variety
    shuffleArray(players);

    // Assign each player to the lightest active team
    players.forEach((player) => {
      if (activeTeams.size === 0) {
        throw new Error('No active teams available for player assignment');
      }

      // Find the active team with smallest total rating
      let lightestTeamIndex = -1;
      let lightestTotal = Infinity;

      activeTeams.forEach((teamIdx) => {
        if (totalRatings[teamIdx] < lightestTotal) {
          lightestTotal = totalRatings[teamIdx];
          lightestTeamIndex = teamIdx;
        }
      });

      // Assign player to lightest active team
      teams[lightestTeamIndex].push(player);
      totalRatings[lightestTeamIndex] += player.rating;

      // Soft-remove team if it has reached capacity
      if (teams[lightestTeamIndex].length === capacities[lightestTeamIndex]) {
        activeTeams.delete(lightestTeamIndex);
      }
    });
  });

  return teams;
}

/**
 * Distributes players across teams in descending rating order.
 * For each player group (by rating), shuffles players and assigns each to the lightest team.
 *
 * @param ratingGroups Sorted array of [rating, players[]] tuples (descending)
 * @param teamCount Number of teams
 * @returns Array of teams, each containing PlayerModel objects
 * @deprecated Use distributePlayersAcrossTeamsWithCapacity instead
 */
export function distributePlayersAcrossTeams(
  ratingGroups: Array<[number, PlayerModel[]]>,
  teamCount: number
): PlayerModel[][] {
  const teams: PlayerModel[][] = Array.from({ length: teamCount }, () => []);
  const totalRatings: number[] = Array.from({ length: teamCount }, () => 0);

  // Iterate through each rating group (highest first due to descending sort)
  ratingGroups.forEach(([rating, players]) => {
    // Shuffle players within this rating group for variety
    shuffleArray(players);

    // Assign each player to the lightest team
    players.forEach((player) => {
      assignPlayerToLightestTeam(player, teams, totalRatings);
    });
  });

  return teams;
}

/**
 * Allocates players to teams using hybrid greedy assignment with capacity constraints.
 * Steps:
 * 1. Normalize players (dedupe, trim, validate, round ratings to 1-10)
 * 2. Group by rating (1-10 buckets) in descending order
 * 3. Shuffle within each rating group for randomness
 * 4. Compute team capacities (base + remainder distributed)
 * 5. For each player (highest-rated first), assign to the team with lowest total rating among active teams
 * 6. Soft-remove teams once they reach capacity
 * 7. Shuffle final team order for presentation
 *
 * Guarantees: All teams differ in size by at most 1, rating totals are balanced by greedy assignment.
 *
 * @param players Array of players with name and rating
 * @param teamCount Number of teams to create
 * @returns Array of TeamModel objects with players and totalRating
 * @throws Error if invalid input
 */
export function allocatePlayersToTeams(
  players: PlayerModel[],
  teamCount: number
): TeamModel[] {
  // Validate input
  if (teamCount < 1) {
    throw new Error('Team count must be at least 1');
  }
  if (players.length === 0) {
    throw new Error('No players to allocate');
  }
  if (players.length < teamCount) {
    throw new Error(`Not enough players (${players.length}) for ${teamCount} teams`);
  }

  // Step 1: Normalize players (dedupe, trim, validate, round ratings)
  const normalizedPlayers = normalizePlayers(players);

  // Step 2: Group by rating in descending order (highest first)
  const ratingGroups = groupPlayersByRatingDescending(normalizedPlayers);

  // Step 3-6: Distribute across teams with capacity constraints
  const playerTeams = distributePlayersAcrossTeamsWithCapacity(ratingGroups, teamCount);

  // Calculate total ratings for each team
  const teams: TeamModel[] = playerTeams.map((team) => ({
    players: team,
    totalRating: team.reduce((sum, player) => sum + player.rating, 0),
  }));

  // Step 7: Shuffle final team order for variety (teams are not ranked)
  shuffleArray(teams);

  return teams;
}
