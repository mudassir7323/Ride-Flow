import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

type VehicleRow = RowDataPacket & { vehicle_id: number };

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["driver"]);
    if (error || !session) return error;
    const rideId = Number(params.id);

    // Get the driver's active verified vehicle
    const [vehicleRows] = await db.query<VehicleRow[]>(
      `SELECT vehicle_id FROM vehicles
       WHERE driver_id = ? AND verification_status = 'verified' AND is_active = TRUE
       LIMIT 1`,
      [session.user.driverId]
    );
    const vehicleId = vehicleRows[0]?.vehicle_id ?? null;

    await db.query(
      `UPDATE rides
       SET driver_id = ?, vehicle_id = ?, ride_status = 'accepted'
       WHERE ride_id = ? AND ride_status = 'requested'`,
      [session.user.driverId, vehicleId, rideId]
    );
    await db.query(
      "UPDATE drivers SET availability_status = 'on_trip' WHERE driver_id = ?",
      [session.user.driverId]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/rides/[id]/accept error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
