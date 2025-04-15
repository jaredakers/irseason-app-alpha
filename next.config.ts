import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/ws",
        headers: [
          { key: "Upgrade", value: "websocket" },
          { key: "Connection", value: "Upgrade" },
        ],
      },
    ];
  },
};

export default nextConfig;
