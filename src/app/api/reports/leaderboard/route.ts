import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM vw_driver_leaderboard ORDER BY city ASC, city_rank ASC"
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/reports/leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
