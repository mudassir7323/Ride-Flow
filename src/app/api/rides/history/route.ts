import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(["rider", "driver"]);
    if (error || !session) return error;

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const offset = (page - 1) * pageSize;

    let query = "SELECT * FROM rides WHERE ";
    let args: unknown[] = [];
    if (session.user.role === "rider") {
      query += "rider_id = ? ";
      args = [session.user.id];
    } else {
      query += "driver_id = ? ";
      args = [session.user.driverId];
    }
    query +=
      "AND ride_status IN ('completed','cancelled') ORDER BY request_time DESC LIMIT ? OFFSET ?";
    args.push(pageSize, offset);

    const [rows] = await db.query<RowDataPacket[]>(query, args);
    return NextResponse.json({ page, pageSize, data: rows }, { status: 200 });
  } catch (error) {
    console.error("GET /api/rides/history error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
