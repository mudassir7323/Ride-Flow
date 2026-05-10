import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export type AppRole = "admin" | "rider" | "driver";

export async function requireAuth(allowedRoles?: AppRole[]) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { session, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}

export function isSelfOrAdmin(sessionUserId: number, targetUserId: number, role: AppRole) {
  return role === "admin" || sessionUserId === targetUserId;
}
