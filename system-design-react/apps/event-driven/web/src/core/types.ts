/** A game event flowing through the EventBus */
export interface GameEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface Team {
  name: string;
  shortName: string;
  logo: string;
}

export interface Match {
  id: string;
  leagueId: string;
  homeTeam: Team;
  awayTeam: Team;
  status: 'live' | 'finished' | 'upcoming';
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  startTime: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  icon: string;
}

// Event payload types
export interface MatchStartedPayload {
  homeTeam: string;
  awayTeam: string;
  competition: string;
}

export interface GoalScoredPayload {
  player: string;
  team: 'home' | 'away';
  assist: string | null;
  minute: number;
}

export interface CardGivenPayload {
  player: string;
  team: 'home' | 'away';
  card: 'yellow' | 'red';
  reason: string;
  minute: number;
}

export interface SubstitutionPayload {
  teamSide: 'home' | 'away';
  playerOut: string;
  playerIn: string;
  minute: number;
}

export interface HalfTimePayload {
  homeScore: number;
  awayScore: number;
}

export interface MatchEndedPayload {
  homeScore: number;
  awayScore: number;
  result: 'home_win' | 'away_win' | 'draw';
}

export interface PenaltyPayload {
  player: string;
  team: 'home' | 'away';
  scored: boolean;
  minute: number;
}

export interface VarReviewPayload {
  decision: string;
  originalCall: string;
  minute: number;
}
