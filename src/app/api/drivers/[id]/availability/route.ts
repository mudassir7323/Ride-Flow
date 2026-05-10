import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const Schema = z.object({
  availability_status: z.enum(["online", "offline"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["driver"]);
    if (error || !session) return error;
    const targetDriverId = Number(params.id);
    if (session.user.driverId !== targetDriverId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await db.query("UPDATE drivers SET availability_status = ? WHERE driver_id = ?", [
      parsed.data.availability_status,
      targetDriverId,
    ]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/drivers/[id]/availability error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
