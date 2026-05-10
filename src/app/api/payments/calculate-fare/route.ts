import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { calculateFare } from "@/lib/fare";

const FareEstimateSchema = z.object({
  vehicle_type: z.enum(["economy", "premium", "bike"]),
  distance_km: z.coerce.number().positive(),
  duration_minutes: z.coerce.number().int().positive(),
  active_rides_in_city: z.coerce.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "rider") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = FareEstimateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { vehicle_type, distance_km, duration_minutes, active_rides_in_city } =
      parsed.data;
    const result = await calculateFare(
      vehicle_type,
      distance_km,
      duration_minutes,
      active_rides_in_city
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/payments/calculate-fare error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
