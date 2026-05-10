import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { RideStatusSchema } from "@/lib/validations";

type RideRow = RowDataPacket & {
  rider_id: number;
  fare_amount: number;
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "driver"]);
    if (error || !session) return error;
    const rideId = Number(params.id);
    const parsed = RideStatusSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.status === "completed") {
      const distance = parsed.data.distance_km ?? 1;
      const duration = parsed.data.duration_minutes ?? 5;
      await db.query("CALL sp_complete_ride(?, ?, ?)", [rideId, distance, duration]);

      // Auto-create a pending payment record so the rider can pay
      const [rideRows] = await db.query<RideRow[]>(
        "SELECT rider_id, fare_amount FROM rides WHERE ride_id = ? LIMIT 1",
        [rideId]
      );
      const ride = rideRows[0];
      if (ride?.fare_amount) {
        // Only insert if no payment exists yet
        const [existing] = await db.query<RowDataPacket[]>(
          "SELECT payment_id FROM payments WHERE ride_id = ? LIMIT 1",
          [rideId]
        );
        if (!(existing as RowDataPacket[])[0]) {
          await db.query(
            `INSERT INTO payments (ride_id, rider_id, amount, payment_method, payment_status)
             VALUES (?, ?, ?, 'cash', 'pending')`,
            [rideId, ride.rider_id, ride.fare_amount]
          );
        }
      }

      return NextResponse.json({ success: true, completed: true }, { status: 200 });
    }

    if (session.user.role === "driver") {
      await db.query(
        "UPDATE rides SET ride_status = ? WHERE ride_id = ? AND driver_id = ?",
        [parsed.data.status, rideId, session.user.driverId]
      );
    } else {
      await db.query("UPDATE rides SET ride_status = ? WHERE ride_id = ?", [
        parsed.data.status,
        rideId,
      ]);
    }

    if (["accepted", "en_route", "in_progress"].includes(parsed.data.status) && session.user.driverId) {
      await db.query("UPDATE drivers SET availability_status = 'on_trip' WHERE driver_id = ?", [
        session.user.driverId,
      ]);
    }
    if (["cancelled"].includes(parsed.data.status) && session.user.driverId) {
      await db.query("UPDATE drivers SET availability_status = 'online' WHERE driver_id = ?", [
        session.user.driverId,
      ]);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/rides/[id]/status error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
