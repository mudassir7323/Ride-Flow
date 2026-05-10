import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT r.rating_id, r.ride_id, r.score, r.comment, r.timestamp, u.full_name AS rated_by
       FROM ratings r
       JOIN rides ri ON ri.ride_id = r.ride_id
       JOIN drivers d ON d.driver_id = ri.driver_id
       JOIN users u ON u.user_id = r.rated_by_user_id
       WHERE d.driver_id = ?
       ORDER BY r.timestamp DESC`,
      [Number(params.id)]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/ratings/driver/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
