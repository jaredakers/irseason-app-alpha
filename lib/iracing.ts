// lib/iracing.ts
import axios from "axios";
import { MemberStats, RaceResult } from "../types/iracing";

const BASE_URL = "https://members-ng.iracing.com";

export async function authenticate(): Promise<string> {
  const response = await axios.post(
    `${BASE_URL}/auth/login2`,
    {
      email: process.env.IRACING_USERNAME,
      password: process.env.IRACING_PASSWORD,
    },
    { withCredentials: true }
  );
  return response.headers["set-cookie"]?.[0] || "";
}

export async function getMemberStats(
  memberId: string,
  cookie: string
): Promise<MemberStats> {
  try {
    // Step 1: Fetch initial data from /data/stats/member_recent_races
    const initialResponse = await axios.get(
      `${BASE_URL}/data/stats/member_recent_races?cust_id=${memberId}`,
      {
        headers: { Cookie: cookie },
      }
    );

    const { link } = initialResponse.data;
    if (!link) {
      throw new Error("No link provided in initial response");
    }

    // Step 2: Fetch the linked JSON data
    const linkResponse = await axios.get(link);
    const linkedData = linkResponse.data;

    // Step 3: Parse races data
    const recentRaces: RaceResult[] =
      linkedData.races?.map((race: any) => ({
        sessionId: race.subsession_id || 0, // Use subsession_id or fallback
        seriesName: race.series_name || "Unknown Series",
        track: { trackName: race.track?.track_name || "Unknown Track" },
        winnerName: race.winner_name || "Unknown",
        points: race.points || 0,
        licenseLevel: race.license_level || 0,
        startPosition: race.start_position || 0,
        finishPosition: race.finish_position || 0,
        laps: race.laps || 0,
        incidents: race.incidents || 0,
      })) || [];

    return { recentRaces };
  } catch (error) {
    console.error("Error fetching member stats:", error.message);
    return { recentRaces: [] }; // Return empty array on error
  }
}
