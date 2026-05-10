import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message: "Use /api/reports/revenue, /api/reports/earnings, or /api/reports/leaderboard",
    },
    { status: 200 }
  );
}
