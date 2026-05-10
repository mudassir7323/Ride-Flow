import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { CreateVehicleSchema } from "@/lib/validations";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "driver"]);
    if (error || !session) return error;
    const vehicleId = Number(params.id);

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT v.*, d.user_id AS driver_user_id
       FROM vehicles v
       JOIN drivers d ON d.driver_id = v.driver_id
       WHERE v.vehicle_id = ? LIMIT 1`,
      [vehicleId]
    );
    const vehicle = rows[0];
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (session.user.role === "driver" && vehicle.driver_user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    console.error("GET /api/vehicles/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["driver"]);
    if (error || !session) return error;
    const vehicleId = Number(params.id);

    const [ownerRows] = await db.query<RowDataPacket[]>(
      `SELECT v.vehicle_id FROM vehicles v
       JOIN drivers d ON d.driver_id = v.driver_id
       WHERE v.vehicle_id = ? AND d.user_id = ?`,
      [vehicleId, session.user.id]
    );
    if (!ownerRows[0]) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const parsed = CreateVehicleSchema.partial().safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(parsed.data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (!fields.length) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    await db.query(`UPDATE vehicles SET ${fields.join(", ")} WHERE vehicle_id = ?`, [
      ...values,
      vehicleId,
    ]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/vehicles/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
