import { z } from "zod";

export const RegisterSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(8),
  role: z.enum(["rider", "driver"]),
});

export const LocationInputSchema = z.object({
  address: z.string().min(3).max(500),
  city: z.string().min(2).max(100),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const CreateRideSchema = z.object({
  pickup: LocationInputSchema,
  dropoff: LocationInputSchema,
  vehicle_type: z.enum(["economy", "premium", "bike"]),
  scheduled_time: z.string().optional(),
});

export const CreateVehicleSchema = z.object({
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.coerce.number().int().min(1980).max(2100),
  color: z.string().min(1).max(30),
  license_plate: z.string().min(3).max(20),
  vehicle_type: z.enum(["economy", "premium", "bike"]),
});

export const CreateRatingSchema = z.object({
  ride_id: z.coerce.number().int().positive(),
  rated_user_id: z.coerce.number().int().positive(),
  score: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const CreateComplaintSchema = z.object({
  ride_id: z.coerce.number().int().positive(),
  against_user_id: z.coerce.number().int().positive(),
  complaint_text: z.string().min(5).max(2000),
});

export const UpdateUserSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  account_status: z.enum(["active", "suspended", "banned"]).optional(),
});

export const UpdateStatusSchema = z.object({
  account_status: z.enum(["active", "suspended", "banned"]),
});

export const RideStatusSchema = z.object({
  status: z.enum([
    "requested",
    "accepted",
    "en_route",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  distance_km: z.coerce.number().positive().optional(),
  duration_minutes: z.coerce.number().int().positive().optional(),
});

export const PromoCreateSchema = z.object({
  code: z.string().min(3).max(30),
  discount_type: z.enum(["percentage", "flat"]),
  discount_value: z.coerce.number().positive(),
  expiry_date: z.string(),
  usage_limit: z.coerce.number().int().positive().default(100),
});

export const PromoValidateSchema = z.object({
  code: z.string().min(3).max(30),
  fare: z.coerce.number().nonnegative(),
});

export const CreatePaymentSchema = z.object({
  ride_id: z.coerce.number().int().positive(),
  rider_id: z.coerce.number().int().positive(),
  promo_code: z.string().optional(),
  amount: z.coerce.number().positive(),
  payment_method: z.enum(["cash", "wallet", "card"]),
});

export const UpdatePaymentSchema = z.object({
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]),
  payment_method: z.enum(["cash", "wallet", "card"]).optional(),
});
