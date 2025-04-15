// types/iracing.ts
export interface RaceResult {
  sessionId: number; // Maps to a unique race identifier (e.g., subsession_id)
  seriesName: string; // race.series_name
  track: { trackName: string }; // race.track.track_name
  winnerName: string; // race.winner_name
  points: number; // race.points
  licenseLevel: number; // race.license_level
  startPosition: number; // race.start_position
  finishPosition: number; // race.finish_position
  laps: number; // race.laps
  incidents: number; // race.incidents
}

export interface MemberStats {
  recentRaces: RaceResult[];
}
