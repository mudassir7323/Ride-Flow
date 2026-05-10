import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "rider", "driver"]);
    if (error || !session) return error;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT r.*, u.full_name AS rider_name,
              d.driver_id, d.user_id AS driver_user_id,
              ud.full_name AS driver_name
       FROM rides r
       JOIN users u ON u.user_id = r.rider_id
       LEFT JOIN drivers d ON d.driver_id = r.driver_id
       LEFT JOIN users ud ON ud.user_id = d.user_id
       WHERE r.ride_id = ? LIMIT 1`,
      [Number(params.id)]
    );
    const ride = rows[0];
    if (!ride) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (
      session.user.role !== "admin" &&
      session.user.id !== Number(ride.rider_id) &&
      session.user.driverId !== Number(ride.driver_id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(ride, { status: 200 });
  } catch (error) {
    console.error("GET /api/rides/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
