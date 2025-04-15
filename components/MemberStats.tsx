// components/MemberStats.tsx
"use client";

import { useState, useEffect } from "react";
import { RaceResult } from "../types/iracing";

interface MemberStatsProps {
  memberId: string;
}

export default function MemberStats({ memberId }: MemberStatsProps) {
  const [stats, setStats] = useState<RaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) {
      setStats([]);
      setError(null);
      return;
    }

    // Fetch initial stats
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stats/${memberId}`);
        const text = await response.text();
        console.log("Raw API response:", text);
        if (!response.ok) {
          throw new Error(JSON.parse(text).error || `HTTP ${response.status}`);
        }
        const data = JSON.parse(text);
        console.log("Parsed stats:", data);
        setStats(data.recentRaces || []);
        if (!data.recentRaces?.length) {
          setError("No races found for this member.");
        }
      } catch (err) {
        setError(err.message || "Error fetching stats. Please try again.");
        console.error("Fetch error:", err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // WebSocket for real-time updates
    const ws = new WebSocket("ws://localhost:3000/api/ws");
    ws.onopen = () => {
      console.log("WebSocket connected for memberId:", memberId);
      ws.send(JSON.stringify({ memberId }));
    };
    ws.onmessage = (event) => {
      const newStats = JSON.parse(event.data) as RaceResult[];
      console.log("WebSocket stats:", newStats);
      setStats((prev) => [...prev, ...newStats]);
      setError(newStats.length ? null : "No new races found.");
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("Real-time updates unavailable.");
    };

    return () => {
      ws.close();
    };
  }, [memberId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Recent Races</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && stats.length === 0 && <p>No races found.</p>}
      {stats.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Series</th>
              <th className="border p-2">Track</th>
              <th className="border p-2">Finish Position</th>
              <th className="border p-2">Laps</th>
              <th className="border p-2">Incidents</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((race) => (
              <tr key={race.sessionId}>
                <td className="border p-2">{race.seriesName}</td>
                <td className="border p-2">{race.track.trackName}</td>
                <td className="border p-2">{race.finishPosition}</td>
                <td className="border p-2">{race.laps}</td>
                <td className="border p-2">{race.incidents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
