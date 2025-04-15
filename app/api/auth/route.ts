import { NextResponse } from "next/server";
import { authenticate } from "../../../lib/iracing";

export async function POST() {
  try {
    const cookie = await authenticate();
    return NextResponse.json({ cookie });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
