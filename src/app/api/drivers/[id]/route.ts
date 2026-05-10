import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const UpdateDriverSchema = z.object({
  license_number: z.string().min(3).max(50).optional(),
  cnic: z.string().min(13).max(20).optional(),
  profile_photo: z.string().url().max(500).optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "driver"]);
    if (error || !session) return error;
    const driverId = Number(params.id);

    if (session.user.role === "driver") {
      const [selfRows] = await db.query<RowDataPacket[]>(
        "SELECT driver_id FROM drivers WHERE user_id = ? LIMIT 1",
        [session.user.id]
      );
      if (selfRows[0]?.driver_id !== driverId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT d.*, u.full_name, u.email, u.phone, u.account_status
       FROM drivers d JOIN users u ON d.user_id = u.user_id
       WHERE d.driver_id = ? LIMIT 1`,
      [driverId]
    );
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("GET /api/drivers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "driver"]);
    if (error || !session) return error;
    const driverId = Number(params.id);

    if (session.user.role === "driver" && session.user.driverId !== driverId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = UpdateDriverSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    if (parsed.data.license_number !== undefined) {
      fields.push("license_number = ?");
      values.push(parsed.data.license_number);
    }
    if (parsed.data.cnic !== undefined) {
      fields.push("cnic = ?");
      values.push(parsed.data.cnic);
    }
    if (parsed.data.profile_photo !== undefined) {
      fields.push("profile_photo = ?");
      values.push(parsed.data.profile_photo);
    }
    if (!fields.length) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    await db.query(`UPDATE drivers SET ${fields.join(", ")} WHERE driver_id = ?`, [
      ...values,
      driverId,
    ]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/drivers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
