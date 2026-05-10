export type UserRole = "admin" | "rider" | "driver";

export type RideStatus =
  | "requested"
  | "accepted"
  | "en_route"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type VehicleType = "economy" | "premium" | "bike";
