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
 * Distributes players across teams in descending rating order.
 * For each player group (by rating), shuffles players and assigns each to the lightest team.
 *
 * @param ratingGroups Sorted array of [rating, players[]] tuples (descending)
 * @param teamCount Number of teams
 * @returns Array of teams, each containing PlayerModel objects
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
 * Allocates players to teams using greedy balanced assignment.
 * Steps:
 * 1. Normalize players (dedupe, trim, validate, round ratings to 1-10)
 * 2. Group by rating (1-10 buckets) in descending order
 * 3. Shuffle within each rating group
 * 4. For each player, assign to the team with lowest total rating
 * 5. Shuffle final team order for presentation
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

  // Step 3-4: Distribute across teams (shuffles within groups and assigns to lightest team)
  const playerTeams = distributePlayersAcrossTeams(ratingGroups, teamCount);

  // Calculate total ratings for each team
  const teams: TeamModel[] = playerTeams.map((team) => ({
    players: team,
    totalRating: team.reduce((sum, player) => sum + player.rating, 0),
  }));

  // Step 5: Shuffle final team order for variety (teams are not ranked)
  shuffleArray(teams);

  return teams;
}
