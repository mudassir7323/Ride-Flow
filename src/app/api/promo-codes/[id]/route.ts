import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const UpdatePromoSchema = z.object({
  is_active: z.boolean().optional(),
  usage_limit: z.coerce.number().int().positive().optional(),
  expiry_date: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const parsed = UpdatePromoSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    if (parsed.data.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(parsed.data.is_active);
    }
    if (parsed.data.usage_limit !== undefined) {
      fields.push("usage_limit = ?");
      values.push(parsed.data.usage_limit);
    }
    if (parsed.data.expiry_date !== undefined) {
      fields.push("expiry_date = ?");
      values.push(parsed.data.expiry_date);
    }
    if (!fields.length) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    await db.query(`UPDATE promo_codes SET ${fields.join(", ")} WHERE promo_id = ?`, [
      ...values,
      Number(params.id),
    ]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/promo-codes/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    await db.query("DELETE FROM promo_codes WHERE promo_id = ?", [Number(params.id)]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/promo-codes/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
