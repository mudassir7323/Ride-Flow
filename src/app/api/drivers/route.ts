import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    const { searchParams } = new URL(req.url);
    const verification = searchParams.get("verification_status");
    const availability = searchParams.get("availability_status");

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT d.driver_id, d.user_id, u.full_name, u.email, d.verification_status,
              d.availability_status, d.total_trips_completed, d.average_rating, d.wallet_balance
       FROM drivers d
       JOIN users u ON u.user_id = d.user_id
       WHERE (? IS NULL OR d.verification_status = ?)
         AND (? IS NULL OR d.availability_status = ?)
       ORDER BY d.created_at DESC`,
      [verification, verification, availability, availability]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/drivers error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
