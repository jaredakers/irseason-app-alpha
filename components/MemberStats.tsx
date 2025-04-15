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

  useEffect(() => {
    if (!memberId) return;

    // Fetch initial stats
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats/${memberId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data.recentRaces);
        if (data.recentRaces.length === 0) {
          setError("No races found for this member.");
        } else {
          setError(null);
        }
      } catch (err) {
        setError("Error fetching stats. Please try again.");
        console.error(err);
      }
    };

    fetchStats();

    // WebSocket for real-time updates
    const ws = new WebSocket("ws://localhost:3000/api/ws");
    ws.onopen = () => ws.send(JSON.stringify({ memberId }));
    ws.onmessage = (event) => {
      const newStats = JSON.parse(event.data) as RaceResult[];
      setStats((prev) => [...prev, ...newStats]);
      setError(newStats.length === 0 ? "No new races found." : null);
    };

    return () => ws.close();
  }, [memberId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Recent Races</h2>
      {error && <p className="text-red-500">{error}</p>}
      {stats.length === 0 && !error ? (
        <p>Loading...</p>
      ) : stats.length === 0 ? (
        <p>No races found.</p>
      ) : (
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
