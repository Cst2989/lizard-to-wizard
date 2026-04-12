import { League, Match, GameEvent } from '../core/types';

const BASE_URL = '/api';

/** Fetch all leagues */
export async function fetchLeagues(): Promise<League[]> {
  const res = await fetch(`${BASE_URL}/leagues`);
  if (!res.ok) throw new Error('Failed to fetch leagues');
  return res.json();
}

/** Fetch matches for a specific league */
export async function fetchLeagueMatches(leagueId: string): Promise<Match[]> {
  const res = await fetch(`${BASE_URL}/leagues/${leagueId}/matches`);
  if (!res.ok) throw new Error('Failed to fetch matches');
  return res.json();
}

/** Fetch a single match by ID */
export async function fetchMatch(matchId: string): Promise<Match> {
  const res = await fetch(`${BASE_URL}/matches/${matchId}`);
  if (!res.ok) throw new Error('Failed to fetch match');
  return res.json();
}

/** Fetch events for a match, optionally filtered by minute range */
export async function fetchMatchEvents(
  matchId: string,
  from: number = 0,
  to: number = 90
): Promise<GameEvent[]> {
  const res = await fetch(`${BASE_URL}/matches/${matchId}/events?from=${from}&to=${to}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

/** Fetch all favorite match IDs */
export async function fetchFavorites(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/favorites`);
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

/** Add a match to favorites */
export async function addFavorite(matchId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/favorites/${matchId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to add favorite');
}

/** Remove a match from favorites */
export async function removeFavorite(matchId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/favorites/${matchId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove favorite');
}
