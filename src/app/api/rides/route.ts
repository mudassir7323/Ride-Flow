import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateRideSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/api-auth";

type OutRideId = RowDataPacket & { ride_id: number };

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    const { searchParams } = new URL(req.url);
    const rideStatus = searchParams.get("ride_status");
    const city = searchParams.get("city");

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT r.*, l.city AS pickup_city
       FROM rides r
       JOIN locations l ON l.location_id = r.pickup_location_id
       WHERE (? IS NULL OR r.ride_status = ?)
         AND (? IS NULL OR l.city = ?)
       ORDER BY r.request_time DESC`,
      [rideStatus, rideStatus, city, city]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/rides error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "rider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateRideSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { pickup, dropoff, vehicle_type, scheduled_time } = parsed.data;

    const [pickupRes] = await db.query<ResultSetHeader>(
      "INSERT INTO locations (address, city, latitude, longitude) VALUES (?, ?, ?, ?)",
      [pickup.address, pickup.city, pickup.lat, pickup.lng]
    );
    const [dropoffRes] = await db.query<ResultSetHeader>(
      "INSERT INTO locations (address, city, latitude, longitude) VALUES (?, ?, ?, ?)",
      [dropoff.address, dropoff.city, dropoff.lat, dropoff.lng]
    );

    await db.query("CALL sp_create_ride(?, ?, ?, ?, @ride_id)", [
      session.user.id,
      pickupRes.insertId,
      dropoffRes.insertId,
      vehicle_type,
    ]);
    const [rideRows] = await db.query<OutRideId[]>("SELECT @ride_id AS ride_id");
    const rideId = rideRows[0]?.ride_id;

    if (!rideId) {
      return NextResponse.json(
        { error: "Failed to create ride." },
        { status: 500 }
      );
    }

    if (scheduled_time) {
      await db.query("UPDATE rides SET scheduled_time = ? WHERE ride_id = ?", [
        scheduled_time,
        rideId,
      ]);
    }

    return NextResponse.json({ ride_id: rideId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rides error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
