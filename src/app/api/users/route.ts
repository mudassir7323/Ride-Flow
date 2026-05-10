import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/api-auth";

type ExistingUser = RowDataPacket & { user_id: number };

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT user_id, full_name, email, phone, role, account_status, registration_date
       FROM users
       WHERE (? IS NULL OR role = ?)
         AND (? IS NULL OR account_status = ?)
         AND (? IS NULL OR full_name LIKE CONCAT('%', ?, '%') OR email LIKE CONCAT('%', ?, '%'))
       ORDER BY registration_date DESC`,
      [role, role, status, status, q, q, q]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { full_name, email, phone, password, role } = parsed.data;

    const [existingRows] = await db.query<ExistingUser[]>(
      "SELECT user_id FROM users WHERE email = ? OR phone = ? LIMIT 1",
      [email, phone]
    );
    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: "Email or phone already registered." },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, phone, hash, role]
    );

    // Automatically create a drivers record for driver registrations
    if (role === "driver") {
      await db.query(
        "INSERT INTO drivers (user_id) VALUES (?)",
        [result.insertId]
      );
    }

    return NextResponse.json({ user_id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
