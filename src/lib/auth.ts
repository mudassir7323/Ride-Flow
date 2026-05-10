import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

type DbUser = RowDataPacket & {
  user_id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: "admin" | "rider" | "driver";
};

type DbDriver = RowDataPacket & { driver_id: number };

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const [userRows] = await db.query<DbUser[]>(
          'SELECT * FROM users WHERE email = ? AND account_status = "active" LIMIT 1',
          [credentials.email]
        );
        const user = userRows[0];
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        let driverId: number | null = null;
        if (user.role === "driver") {
          const [driverRows] = await db.query<DbDriver[]>(
            "SELECT driver_id FROM drivers WHERE user_id = ? LIMIT 1",
            [user.user_id]
          );
          driverId = driverRows[0]?.driver_id ?? null;
        }

        return {
          id: user.user_id,
          name: user.full_name,
          email: user.email,
          role: user.role,
          driverId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = String(user.id);
        token.role = user.role;
        token.driverId = user.driverId;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;
      session.user.id = Number(token.sub);
      session.user.role = token.role ?? "rider";
      session.user.driverId = token.driverId ?? null;
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};
