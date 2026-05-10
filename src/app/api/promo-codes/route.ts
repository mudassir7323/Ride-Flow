import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { PromoCreateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT promo_id, code, discount_type, discount_value, expiry_date,
              usage_limit, used_count, is_active
       FROM promo_codes
       ORDER BY promo_id DESC`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/promo-codes error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    const parsed = PromoCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO promo_codes (code, discount_type, discount_value, expiry_date, usage_limit, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [
        parsed.data.code,
        parsed.data.discount_type,
        parsed.data.discount_value,
        parsed.data.expiry_date,
        parsed.data.usage_limit,
      ]
    );
    return NextResponse.json({ promo_id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/promo-codes error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
