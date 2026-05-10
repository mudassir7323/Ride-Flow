import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "rider", "driver"]);
    if (error || !session) return error;
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM complaints WHERE complaint_id = ? LIMIT 1",
      [Number(params.id)]
    );
    const complaint = rows[0];
    if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (
      session.user.role !== "admin" &&
      session.user.id !== Number(complaint.complainant_user_id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(complaint, { status: 200 });
  } catch (error) {
    console.error("GET /api/complaints/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
