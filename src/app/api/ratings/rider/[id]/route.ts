import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAuth(["admin", "driver"]);
    if (error) return error;
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT r.rating_id, r.ride_id, r.score, r.comment, r.timestamp, u.full_name AS rated_by
       FROM ratings r
       JOIN users u ON u.user_id = r.rated_by_user_id
       WHERE r.rated_user_id = ?
       ORDER BY r.timestamp DESC`,
      [Number(params.id)]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/ratings/rider/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
