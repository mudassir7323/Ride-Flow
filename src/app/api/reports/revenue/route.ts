import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT DATE(r.end_time) AS date, l.city, COUNT(r.ride_id) AS total_rides,
              SUM(r.fare_amount) AS gross_revenue, SUM(r.fare_amount * 0.15) AS platform_commission,
              SUM(p.discount_applied) AS total_discounts,
              COUNT(CASE WHEN p.payment_method='card' THEN 1 END) AS card_payments,
              COUNT(CASE WHEN p.payment_method='cash' THEN 1 END) AS cash_payments,
              COUNT(CASE WHEN p.payment_method='wallet' THEN 1 END) AS wallet_payments
       FROM rides r
       JOIN payments p ON r.ride_id = p.ride_id
       JOIN locations l ON r.pickup_location_id = l.location_id
       WHERE r.ride_status='completed'
         AND (? IS NULL OR l.city = ?)
         AND (? IS NULL OR r.end_time >= ?)
         AND (? IS NULL OR r.end_time <= ?)
       GROUP BY DATE(r.end_time), l.city
       ORDER BY date DESC`,
      [city, city, from, from, to, to]
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/reports/revenue error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
