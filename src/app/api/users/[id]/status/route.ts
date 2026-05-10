import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { UpdateStatusSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const body = await req.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [result] = await db.query("UPDATE users SET account_status = ? WHERE user_id = ?", [
      parsed.data.account_status,
      Number(params.id),
    ]);
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/users/[id]/status error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
