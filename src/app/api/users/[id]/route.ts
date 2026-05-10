import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { requireAuth, isSelfOrAdmin } from "@/lib/api-auth";
import { UpdateUserSchema } from "@/lib/validations";

type UserRow = RowDataPacket & {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: "admin" | "rider" | "driver";
  account_status: "active" | "suspended" | "banned";
};

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "rider", "driver"]);
    if (error || !session) return error;
    const targetUserId = Number(params.id);
    if (!isSelfOrAdmin(session.user.id, targetUserId, session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [rows] = await db.query<UserRow[]>(
      "SELECT user_id, full_name, email, phone, role, account_status FROM users WHERE user_id = ? LIMIT 1",
      [targetUserId]
    );
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, error } = await requireAuth(["admin", "rider", "driver"]);
    if (error || !session) return error;
    const targetUserId = Number(params.id);
    if (!isSelfOrAdmin(session.user.id, targetUserId, session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    if (parsed.data.full_name) {
      fields.push("full_name = ?");
      values.push(parsed.data.full_name);
    }
    if (parsed.data.phone) {
      fields.push("phone = ?");
      values.push(parsed.data.phone);
    }
    if (session.user.role === "admin" && parsed.data.account_status) {
      fields.push("account_status = ?");
      values.push(parsed.data.account_status);
    }
    if (!fields.length) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    await db.query(`UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`, [
      ...values,
      targetUserId,
    ]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    await db.query("DELETE FROM users WHERE user_id = ?", [Number(params.id)]);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
