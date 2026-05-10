"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/shared/PageShell";
import { RideStatusBadge } from "@/components/rides/RideStatusBadge";
import { RatingWidget } from "@/components/ratings/RatingWidget";
import { Clock, Navigation, CheckCircle } from "lucide-react";

type Ride = {
  ride_id: number;
  ride_status: string;
  rider_id: number;
  rider_name: string;
  driver_id: number | null;
  driver_user_id: number | null;
  fare_amount: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  surge_multiplier: number;
  request_time: string;
};

export default function DriverActivePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState("5");
  const [duration, setDuration] = useState("15");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  async function loadRide() {
    const res = await fetch(`/api/rides/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setRide(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRide();
    const interval = setInterval(loadRide, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  async function updateStatus(status: string, extra?: { distance_km?: number; duration_minutes?: number }) {
    setUpdating(true);
    setMessage("");
    const res = await fetch(`/api/rides/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(status === "completed" ? "Ride completed! Earnings updated." : `Status updated to ${status}`);
      await loadRide();
      // Don't auto-redirect on complete — let driver rate the rider first
    } else {
      setMessage(data.error ?? "Update failed");
    }
    setUpdating(false);
  }

  async function completeRide() {
    const dist = parseFloat(distance);
    const dur = parseInt(duration);
    if (!dist || dist <= 0 || !dur || dur <= 0) {
      setMessage("Please enter valid distance and duration.");
      return;
    }
    await updateStatus("completed", { distance_km: dist, duration_minutes: dur });
  }

  if (loading) {
    return (
      <PageShell title="Active Ride">
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  if (!ride) {
    return (
      <PageShell title="Active Ride">
        <p className="text-slate-400">Ride not found.</p>
      </PageShell>
    );
  }

  const isCompleted = ride.ride_status === "completed";
  const isCancelled = ride.ride_status === "cancelled";

  return (
    <PageShell title={`Ride #${ride.ride_id}`} subtitle="Manage your active ride">
      <div className="max-w-2xl space-y-6">

        {/* Status card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ride Status</h2>
            <RideStatusBadge status={ride.ride_status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Rider</p>
              <p className="font-medium text-slate-100">{ride.rider_name}</p>
            </div>
            <div>
              <p className="text-slate-500">Requested</p>
              <p className="font-medium text-slate-100">{new Date(ride.request_time).toLocaleTimeString()}</p>
            </div>
            {ride.surge_multiplier > 1 && (
              <div>
                <p className="text-slate-500">Surge</p>
                <p className="font-medium text-amber-400">{ride.surge_multiplier}x</p>
              </div>
            )}
            {ride.fare_amount && (
              <div>
                <p className="text-slate-500">Fare</p>
                <p className="text-2xl font-bold text-emerald-400">₨{Number(ride.fare_amount).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {!isCompleted && !isCancelled && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Update Status</h2>

            <div className="flex flex-wrap gap-3">
              {ride.ride_status === "accepted" && (
                <button
                  onClick={() => updateStatus("en_route")}
                  disabled={updating}
                  className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
                >
                  <Navigation className="h-4 w-4" />
                  En Route to Pickup
                </button>
              )}
              {ride.ride_status === "en_route" && (
                <button
                  onClick={() => updateStatus("in_progress")}
                  disabled={updating}
                  className="flex items-center gap-2 rounded-xl bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
                >
                  <Clock className="h-4 w-4" />
                  Start Ride
                </button>
              )}
            </div>

            {/* Complete ride section */}
            {(ride.ride_status === "in_progress" || ride.ride_status === "en_route" || ride.ride_status === "accepted") && (
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h3 className="font-medium text-slate-200">Complete Ride</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Distance (km)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={distance}
                      onChange={e => setDistance(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  onClick={completeRide}
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {updating ? "Completing..." : "Complete Ride & Calculate Fare"}
                </button>
              </div>
            )}

            {/* Cancel */}
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={updating}
              className="w-full rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              Cancel Ride
            </button>
          </div>
        )}

        {/* Completed summary + rating */}
        {isCompleted && (
          <>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
              <h2 className="text-xl font-bold text-emerald-400">Ride Completed!</h2>
              <p className="mt-1 text-slate-400">
                Fare: <span className="font-bold text-emerald-400">₨{Number(ride.fare_amount).toLocaleString()}</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Your earnings: ₨{(Number(ride.fare_amount) * 0.85).toFixed(2)} (after 15% commission)
              </p>
            </div>

            {/* Driver rates the rider */}
            <RatingWidget
              rideId={ride.ride_id}
              ratedUserId={ride.rider_id}
              ratedUserName={ride.rider_name}
              label="Rate your rider"
              onDone={() => setTimeout(() => router.push("/driver/dashboard"), 1500)}
            />
          </>
        )}

        {message && (
          <p className={`text-sm ${message.includes("failed") || message.includes("valid") ? "text-red-400" : "text-emerald-400"}`}>
            {message}
          </p>
        )}
      </div>
    </PageShell>
  );
}
