import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      role: "admin" | "rider" | "driver";
      driverId: number | null;
    };
  }

  interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "rider" | "driver";
    driverId: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "rider" | "driver";
    driverId?: number | null;
  }
}
