import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { UpdatePaymentSchema } from "@/lib/validations";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "rider"]);
    if (error || !session) return error;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT payment_id, ride_id, rider_id, promo_id, amount, discount_applied,
              payment_method, payment_status, transaction_date
       FROM payments WHERE payment_id = ? LIMIT 1`,
      [Number(params.id)]
    );
    const payment = rows[0];
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (session.user.role === "rider" && payment.rider_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "rider"]);
    if (error || !session) return error;

    const parsed = UpdatePaymentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Riders can only mark their own payments as paid
    if (session.user.role === "rider") {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT rider_id FROM payments WHERE payment_id = ? LIMIT 1",
        [Number(params.id)]
      );
      const payment = rows[0];
      if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (payment.rider_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Riders can only set status to 'paid'
      if (parsed.data.payment_status !== "paid") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await db.query(
      "UPDATE payments SET payment_status = ?, payment_method = COALESCE(?, payment_method) WHERE payment_id = ?",
      [parsed.data.payment_status, parsed.data.payment_method ?? null, Number(params.id)]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/payments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
