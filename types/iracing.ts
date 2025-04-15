// types/iracing.ts
export interface RaceResult {
  sessionId: number;
  seriesName: string;
  track: { trackName: string };
  winnerName: string;
  points: number;
  licenseLevel: number;
  startPosition: number;
  finishPosition: number;
  laps: number;
  incidents: number;
}

export interface MemberStats {
  recentRaces: RaceResult[];
}
