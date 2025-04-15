// app/api/stats/[memberId]/route.ts
import { NextResponse } from "next/server";
import { getMemberStats, authenticate } from "../../../../lib/iracing";
import { MemberStats } from "../../../../types/iracing";

export async function GET(
  request: Request,
  context: { params: { memberId: string } }
) {
  const { memberId } = context.params;

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
      { error: "Failed to fetch stats. Please try again later." },
      { status: 500 }
    );
  }
}
