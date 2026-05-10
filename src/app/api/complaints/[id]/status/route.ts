import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const Schema = z.object({
  complaint_status: z.enum(["open", "under_review", "resolved", "dismissed"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await db.query("UPDATE complaints SET complaint_status = ? WHERE complaint_id = ?", [
      parsed.data.complaint_status,
      Number(params.id),
    ]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/complaints/[id]/status error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
