import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(["admin", "driver"]);
    if (error || !session) return error;
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driver_id");

    if (session.user.role === "driver") {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM driver_earnings
         WHERE driver_id = ?
         ORDER BY earned_at DESC`,
        [session.user.driverId]
      );
      return NextResponse.json(rows, { status: 200 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM driver_earnings
       WHERE (? IS NULL OR driver_id = ?)
       ORDER BY earned_at DESC`,
      [driverId, driverId]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/reports/earnings error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
