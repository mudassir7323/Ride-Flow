import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAuth(["driver"]);
    if (error) return error;
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT r.*, l.city, l.address
       FROM rides r
       JOIN locations l ON l.location_id = r.pickup_location_id
       WHERE r.ride_status = 'requested'
         AND (? IS NULL OR l.city = ?)
       ORDER BY r.request_time ASC`,
      [city, city]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/rides/nearby error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
