import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["rider", "driver"]);
    if (error || !session) return error;
    const rideId = Number(params.id);

    if (session.user.role === "rider") {
      await db.query(
        "UPDATE rides SET ride_status = 'cancelled' WHERE ride_id = ? AND rider_id = ? AND ride_status != 'completed'",
        [rideId, session.user.id]
      );
    } else {
      await db.query(
        "UPDATE rides SET ride_status = 'cancelled' WHERE ride_id = ? AND driver_id = ? AND ride_status != 'completed'",
        [rideId, session.user.driverId]
      );
      await db.query("UPDATE drivers SET availability_status = 'online' WHERE driver_id = ?", [
        session.user.driverId,
      ]);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/rides/[id]/cancel error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
