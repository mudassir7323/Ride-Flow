import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

type FareConfig = RowDataPacket & {
  base_rate: number;
  per_km_rate: number;
  per_minute_rate: number;
  surge_threshold: number;
  surge_multiplier: number;
};

export async function calculateFare(
  vehicleType: "economy" | "premium" | "bike",
  distanceKm: number,
  durationMinutes: number,
  activeRidesInCity: number
): Promise<{ fare: number; surgeMultiplier: number }> {
  const [rows] = await db.query<FareConfig[]>(
    "SELECT * FROM fare_config WHERE vehicle_type = ? LIMIT 1",
    [vehicleType]
  );
  const config = rows[0];
  if (!config) {
    throw new Error("Fare configuration not found.");
  }

  const surgeMultiplier =
    activeRidesInCity >= config.surge_threshold ? config.surge_multiplier : 1.0;
  const fare =
    (config.base_rate +
      config.per_km_rate * distanceKm +
      config.per_minute_rate * durationMinutes) *
    surgeMultiplier;

  return {
    fare: Math.round(fare * 100) / 100,
    surgeMultiplier,
  };
}
