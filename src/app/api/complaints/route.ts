import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import type { ResultSetHeader } from "mysql2";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateComplaintSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT c.*, u1.full_name AS complainant_name, u2.full_name AS against_name
       FROM complaints c
       JOIN users u1 ON u1.user_id = c.complainant_user_id
       JOIN users u2 ON u2.user_id = c.against_user_id
       ORDER BY c.created_at DESC`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/complaints error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateComplaintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { ride_id, against_user_id, complaint_text } = parsed.data;
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO complaints
      (ride_id, complainant_user_id, against_user_id, complaint_text)
      VALUES (?, ?, ?, ?)`,
      [ride_id, session.user.id, against_user_id, complaint_text]
    );

    return NextResponse.json({ complaint_id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/complaints error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
