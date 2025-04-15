// app/api/stats/[memberId]/route.ts
import { NextResponse } from "next/server";
import { getMemberStats, authenticate } from "../../../../lib/iracing";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const memberId = url.pathname.split("/").pop() || "";

  if (!memberId) {
    return NextResponse.json(
      { error: "Member ID is required" },
      { status: 400 }
    );
  }

  try {
    const cookie = await authenticate();
    const stats = await getMemberStats(memberId, cookie);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("API error:", error.message);
    return NextResponse.json(
      {
        error:
          error.message || "Failed to fetch stats. Please try again later.",
      },
      { status: 500 }
    );
  }
}
