import { NextResponse } from "next/server";
import { getMemberStats, authenticate } from "../../../../lib/iracing";
import { MemberStats } from "../../../../types/iracing";

export async function GET(
  request: Request,
  context: { params: Promise<{ memberId: string }> }
) {
  // Explicitly await the params
  const { memberId } = await context.params;

  if (!memberId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const cookie = await authenticate();
    const stats = await getMemberStats(memberId, cookie);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
