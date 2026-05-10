import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const [[usersRow], [ridesRow], [driversRow], [revenueRow]] = await Promise.all([
      db.query<RowDataPacket[]>("SELECT COUNT(*) AS total_users FROM users"),
      db.query<RowDataPacket[]>("SELECT COUNT(*) AS total_rides FROM rides"),
      db.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS active_drivers FROM drivers WHERE availability_status = 'online'"
      ),
      db.query<RowDataPacket[]>(
        "SELECT COALESCE(SUM(fare_amount), 0) AS gross_revenue FROM rides WHERE ride_status = 'completed'"
      ),
    ]);

    return NextResponse.json(
      {
        total_users: usersRow[0]?.total_users ?? 0,
        total_rides: ridesRow[0]?.total_rides ?? 0,
        active_drivers: driversRow[0]?.active_drivers ?? 0,
        gross_revenue: revenueRow[0]?.gross_revenue ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/reports/stats error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
