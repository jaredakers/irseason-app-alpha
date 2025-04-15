// app/api/ws/route.ts
import { NextRequest } from "next/server";
import { Server } from "ws";
import { getMemberStats, authenticate } from "../../../lib/iracing";

export async function GET(req: NextRequest) {
  const socket = (req as any).socket;
  if (!socket.server.wss) {
    console.log("Initializing WebSocket server");
    const wss = new Server({ server: socket.server });
    socket.server.wss = wss;

    wss.on("connection", async (ws) => {
      console.log("New WebSocket connection established");
      let authCookie: string | null = null;

      try {
        authCookie = await authenticate();
      } catch (error) {
        console.error("WebSocket auth error:", error.message);
        ws.send(JSON.stringify({ error: "Authentication failed" }));
        ws.close();
        return;
      }

      const pollStats = async (memberId: string) => {
        try {
          const stats = await getMemberStats(memberId, authCookie!);
          console.log(
            "WebSocket sending stats for",
            memberId,
            stats.recentRaces.length
          );
          ws.send(JSON.stringify(stats.recentRaces));
        } catch (error) {
          console.error("WebSocket poll error:", error.message);
          ws.send(JSON.stringify({ error: "Failed to fetch stats" }));
        }
      };

      ws.on("message", (message) => {
        try {
          const { memberId } = JSON.parse(message.toString());
          if (memberId) {
            console.log("WebSocket received memberId:", memberId);
            setInterval(() => pollStats(memberId), 60000);
            pollStats(memberId);
          }
        } catch (error) {
          console.error("WebSocket message error:", error.message);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket client error:", error.message);
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
      });
    });

    wss.on("error", (error) => {
      console.error("WebSocket server error:", error.message);
    });
  }

  return new Response(null, { status: 200 });
}

export const config = {
  api: { bodyParser: false },
};
