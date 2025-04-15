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
        setError(
          err.message ||
            "Error fetching stats. Please check credentials or try again."
        );
        console.error("Fetch error:", err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // WebSocket for real-time updates
    let ws: WebSocket | null = null;
    const connectWebSocket = () => {
      ws = new WebSocket("ws://localhost:3000/api/ws");
      ws.onopen = () => {
        console.log("WebSocket connected for memberId:", memberId);
        ws?.send(JSON.stringify({ memberId }));
        setError(null); // Clear WebSocket error on connect
      };
      ws.onmessage = (event) => {
        try {
          const newStats = JSON.parse(event.data);
          console.log("WebSocket stats:", newStats);
          if (newStats.error) {
            setError(newStats.error);
          } else {
            setStats((prev) => [...prev, ...(newStats || [])]);
            setError(newStats.length ? null : "No new races found.");
          }
        } catch (err) {
          console.error("WebSocket parse error:", err);
          setError("Invalid WebSocket data received.");
        }
      };
      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Real-time updates unavailable. Retrying...");
      };
      ws.onclose = () => {
        console.log("WebSocket closed");
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      ws?.close();
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
