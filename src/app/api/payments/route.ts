import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { CreatePaymentSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth(["admin", "rider"]);
    if (error || !session) return error;

    const { searchParams } = new URL(req.url);
    const rideIdFilter = searchParams.get("ride_id");

    let query =
      "SELECT payment_id, ride_id, rider_id, promo_id, amount, discount_applied, payment_method, payment_status, transaction_date FROM payments";
    const args: unknown[] = [];
    const conditions: string[] = [];

    if (session.user.role === "rider") {
      conditions.push("rider_id = ?");
      args.push(session.user.id);
    }
    if (rideIdFilter) {
      conditions.push("ride_id = ?");
      args.push(Number(rideIdFilter));
    }
    if (conditions.length) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY transaction_date DESC";

    const [rows] = await db.query<RowDataPacket[]>(query, args);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = CreatePaymentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let promoId: number | null = null;
    let discount = 0;
    let finalAmount = parsed.data.amount;
    if (parsed.data.promo_code) {
      await db.query("CALL sp_apply_promo(?, ?, @promo_id, @discount, @final)", [
        parsed.data.promo_code,
        parsed.data.amount,
      ]);
      const [promoRows] = await db.query<RowDataPacket[]>(
        "SELECT @promo_id AS promo_id, @discount AS discount, @final AS final"
      );
      promoId = promoRows[0]?.promo_id ?? null;
      discount = Number(promoRows[0]?.discount ?? 0);
      finalAmount = Number(promoRows[0]?.final ?? parsed.data.amount);
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO payments (ride_id, rider_id, promo_id, amount, discount_applied, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        parsed.data.ride_id,
        parsed.data.rider_id,
        promoId,
        finalAmount,
        discount,
        parsed.data.payment_method,
      ]
    );

    return NextResponse.json({ payment_id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
