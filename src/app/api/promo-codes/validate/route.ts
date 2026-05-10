import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { PromoValidateSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAuth(["rider"]);
    if (error) return error;
    const parsed = PromoValidateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await db.query("CALL sp_apply_promo(?, ?, @promo_id, @discount, @final)", [
      parsed.data.code,
      parsed.data.fare,
    ]);
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT @promo_id AS promo_id, @discount AS discount, @final AS final_amount"
    );
    if (!rows[0]?.promo_id) {
      return NextResponse.json({ error: "Promo code invalid." }, { status: 404 });
    }
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("POST /api/promo-codes/validate error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
