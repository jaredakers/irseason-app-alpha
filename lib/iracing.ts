// lib/iracing.ts
import axios from "axios";
import { MemberStats, RaceResult } from "../types/iracing";

const BASE_URL = "https://members-ng.iracing.com";

export async function authenticate(): Promise<string> {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth`,
      {
        email: process.env.IRACING_USERNAME,
        password: process.env.IRACING_PASSWORD,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );

    const { authcode } = response.data;
    if (!authcode) {
      throw new Error("No authcode received in response");
    }

    const cookie = response.headers["set-cookie"]?.[0];
    if (!cookie) {
      throw new Error("No authentication cookie received");
    }

    // Construct authtoken cookie similar to working code
    const authTokenCookie = `authtoken_members=${JSON.stringify({
      authtoken: { authcode, email: process.env.IRACING_USERNAME },
    })}`;

    console.log("Authentication successful, cookie:", authTokenCookie);
    return authTokenCookie;
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message,
      error.response?.status,
      error.response?.data
    );
    throw new Error("Failed to authenticate with iRacing");
  }
}

export async function getMemberStats(
  memberId: string,
  cookie: string
): Promise<MemberStats> {
  try {
    // Step 1: Fetch initial data
    const initialResponse = await axios.get(
      `${BASE_URL}/data/stats/member_recent_races?cust_id=${memberId}`,
      {
        headers: { Cookie: cookie },
      }
    );

    const { link } = initialResponse.data;
    if (!link) {
      console.warn("No link in initial response:", initialResponse.data);
      return { recentRaces: [] };
    }

    // Step 2: Fetch linked data
    const linkResponse = await axios.get(link);
    const linkedData = linkResponse.data;

    // Log for debugging
    console.log("Linked data:", linkedData);

    // Step 3: Parse races
    const recentRaces: RaceResult[] =
      linkedData.races?.map((race: any) => ({
        sessionId: race.subsession_id || 0,
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
    console.error(
      "Error fetching member stats:",
      error.message,
      error.response?.data
    );
    throw new Error("Failed to fetch race data");
  }
}
