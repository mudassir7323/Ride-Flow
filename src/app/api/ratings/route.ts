import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateRatingSchema } from "@/lib/validations";

type RideRow = RowDataPacket & {
  ride_id: number;
  rider_id: number;
  driver_id: number | null;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateRatingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { ride_id, rated_user_id, score, comment } = parsed.data;
    const [rideRows] = await db.query<RideRow[]>(
      "SELECT ride_id, rider_id, driver_id FROM rides WHERE ride_id = ? AND ride_status = 'completed' LIMIT 1",
      [ride_id]
    );
    const ride = rideRows[0];
    if (!ride) {
      return NextResponse.json({ error: "Invalid ride." }, { status: 400 });
    }

    const isParticipant =
      ride.rider_id === session.user.id || session.user.driverId === ride.driver_id;
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const [insertRes] = await db.query<ResultSetHeader>(
      "INSERT INTO ratings (ride_id, rated_by_user_id, rated_user_id, score, comment) VALUES (?, ?, ?, ?, ?)",
      [ride_id, session.user.id, rated_user_id, score, comment ?? null]
    );

    return NextResponse.json({ rating_id: insertRes.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ratings error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
