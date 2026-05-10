import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateVehicleSchema } from "@/lib/validations";

type DriverRow = RowDataPacket & { driver_id: number };

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const driverIdFilter = searchParams.get("driver_id");

    if (session.user.role === "driver") {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT * FROM vehicles WHERE driver_id = (
           SELECT driver_id FROM drivers WHERE user_id = ? LIMIT 1
         ) ORDER BY created_at DESC`,
        [session.user.id]
      );
      return NextResponse.json(rows, { status: 200 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM vehicles
       WHERE (? IS NULL OR driver_id = ?)
       ORDER BY created_at DESC`,
      [driverIdFilter, driverIdFilter]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/vehicles error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "driver") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CreateVehicleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [driverRows] = await db.query<DriverRow[]>(
      "SELECT driver_id FROM drivers WHERE user_id = ? LIMIT 1",
      [session.user.id]
    );
    const driver = driverRows[0];
    if (!driver) {
      return NextResponse.json({ error: "Driver profile missing." }, { status: 404 });
    }

    const { make, model, year, color, license_plate, vehicle_type } = parsed.data;
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO vehicles
      (driver_id, make, model, year, color, license_plate, vehicle_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [driver.driver_id, make, model, year, color, license_plate, vehicle_type]
    );

    return NextResponse.json({ vehicle_id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/vehicles error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
