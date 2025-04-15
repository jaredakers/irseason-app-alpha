// types/iracing.ts
export interface RaceResult {
  sessionId: number; // subsession_id
  seriesName: string; // series_name
  track: { trackName: string }; // track.track_name
  winnerName: string; // winner_name
  points: number; // points
  licenseLevel: number; // license_level
  startPosition: number; // start_position
  finishPosition: number; // finish_position
  laps: number; // laps
  incidents: number; // incidents
}

export interface MemberStats {
  recentRaces: RaceResult[];
}
