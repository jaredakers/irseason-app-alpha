import { NextRequest } from "next/server";
import { Server } from "ws";
import { getMemberStats, authenticate } from "../../../lib/iracing";

export async function GET(req: NextRequest) {
  const { socket, response } = req as any; // Type workaround for WebSocket
  if (!socket.server.wss) {
    const wss = new Server({ server: socket.server });
    socket.server.wss = wss;

    wss.on("connection", async (ws) => {
      const cookie = await authenticate();
      const pollStats = async (memberId: string) => {
        const stats = await getMemberStats(memberId, cookie);
        ws.send(JSON.stringify(stats.recentRaces));
      };

      ws.on("message", (message) => {
        const { memberId } = JSON.parse(message.toString());
        if (memberId) {
          setInterval(() => pollStats(memberId), 60000);
          pollStats(memberId);
        }
      });
    });
  }

  return new Response(null, { status: 200 });
}

export const config = {
  api: { bodyParser: false },
};
