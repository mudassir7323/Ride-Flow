"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/shared/PageShell";
import { RideStatusBadge } from "@/components/rides/RideStatusBadge";
import { RatingWidget } from "@/components/ratings/RatingWidget";
import { User, Car, CreditCard, CheckCircle } from "lucide-react";

type Ride = {
  ride_id: number;
  ride_status: string;
  rider_id: number;
  rider_name: string;
  driver_id: number | null;
  driver_user_id: number | null;
  driver_name: string | null;
  fare_amount: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  surge_multiplier: number;
  request_time: string;
  start_time: string | null;
  end_time: string | null;
};

type Payment = {
  payment_id: number;
  amount: number;
  payment_status: string;
  payment_method: string;
};

export default function RiderRidePage() {
  const params = useParams<{ id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState<"cash" | "wallet" | "card">("cash");
  const [promoCode, setPromoCode] = useState("");
  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState("");

  async function loadRide() {
    const res = await fetch(`/api/rides/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setRide(data);

      // If completed, check for payment
      if (data.ride_status === "completed") {
        const pRes = await fetch("/api/payments");
        if (pRes.ok) {
          const payments: Payment[] = await pRes.json();
          const ridePayment = payments.find((p) => p.payment_id && data.ride_id);
          // Fetch specifically for this ride
          const pRes2 = await fetch(`/api/payments?ride_id=${data.ride_id}`);
          if (pRes2.ok) {
            const pd = await pRes2.json();
            if (Array.isArray(pd) && pd.length > 0) setPayment(pd[0]);
            else if (Array.isArray(payments)) {
              // fallback: find in all payments list
              const found = payments.find((p: any) => p.ride_id === data.ride_id);
              if (found) setPayment(found);
            }
          }
        }
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRide();
    // Poll every 5s while ride is active
    const interval = setInterval(() => {
      if (ride?.ride_status && ["completed", "cancelled"].includes(ride.ride_status)) return;
      loadRide();
    }, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  async function submitPayment() {
    if (!ride) return;
    setPaying(true);
    setPayMessage("");

    const body: any = {
      ride_id: ride.ride_id,
      rider_id: undefined, // will be set server-side from session
      amount: ride.fare_amount,
      payment_method: payMethod,
    };
    if (promoCode.trim()) body.promo_code = promoCode.trim();

    // Use the existing payment record if it exists, just update method + status
    if (payment) {
      const res = await fetch(`/api/payments/${payment.payment_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: "paid", payment_method: payMethod }),
      });
      if (res.ok) {
        setPayMessage("Payment confirmed! Thank you.");
        setPayment({ ...payment, payment_status: "paid", payment_method: payMethod });
      } else {
        setPayMessage("Payment failed. Please try again.");
      }
    }
    setPaying(false);
  }

  async function cancelRide() {
    await fetch(`/api/rides/${params.id}/cancel`, { method: "POST" });
    loadRide();
  }

  if (loading) {
    return (
      <PageShell title="Ride Tracking">
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      </PageShell>
    );
  }

  if (!ride) {
    return (
      <PageShell title="Ride Tracking">
        <p className="text-slate-400">Ride not found.</p>
      </PageShell>
    );
  }

  const isCompleted = ride.ride_status === "completed";
  const isCancelled = ride.ride_status === "cancelled";
  const isPaid = payment?.payment_status === "paid";

  return (
    <PageShell title={`Ride #${ride.ride_id}`} subtitle="Track your ride in real-time">
      <div className="max-w-2xl space-y-6">

        {/* Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Status</h2>
            <RideStatusBadge status={ride.ride_status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {ride.driver_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-slate-500">Driver</p>
                  <p className="font-medium text-slate-100">{ride.driver_name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-slate-500">Requested</p>
                <p className="font-medium text-slate-100">{new Date(ride.request_time).toLocaleTimeString()}</p>
              </div>
            </div>
            {ride.distance_km && (
              <div>
                <p className="text-slate-500">Distance</p>
                <p className="font-medium text-slate-100">{ride.distance_km} km</p>
              </div>
            )}
            {ride.duration_minutes && (
              <div>
                <p className="text-slate-500">Duration</p>
                <p className="font-medium text-slate-100">{ride.duration_minutes} min</p>
              </div>
            )}
            {ride.surge_multiplier > 1 && (
              <div>
                <p className="text-slate-500">Surge</p>
                <p className="font-medium text-amber-400">{ride.surge_multiplier}x</p>
              </div>
            )}
          </div>

          {/* Fare */}
          {ride.fare_amount && (
            <div className="mt-4 rounded-xl bg-slate-800/60 p-4 text-center">
              <p className="text-sm text-slate-400">Total Fare</p>
              <p className="text-3xl font-bold text-emerald-400">₨{Number(ride.fare_amount).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Live status indicator for active rides */}
        {!isCompleted && !isCancelled && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-500" />
              <p className="text-sm text-slate-400">
                {ride.ride_status === "requested" && "Waiting for a driver to accept your ride..."}
                {ride.ride_status === "accepted" && "Driver accepted! They are on their way to pick you up."}
                {ride.ride_status === "en_route" && "Driver is en route to your pickup location."}
                {ride.ride_status === "in_progress" && "You are on your way! Enjoy the ride."}
              </p>
            </div>
            {ride.ride_status === "requested" && (
              <button
                onClick={cancelRide}
                className="mt-4 w-full rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Cancel Ride
              </button>
            )}
          </div>
        )}

        {/* Payment section — shown after completion */}
        {isCompleted && ride.fare_amount && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            {isPaid ? (
              <div className="text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
                <h2 className="text-xl font-bold text-emerald-400">Payment Complete</h2>
                <p className="mt-1 text-slate-400">
                  Paid ₨{Number(ride.fare_amount).toLocaleString()} via {payment?.payment_method}
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                  Complete Payment
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Payment Method</label>
                    <div className="flex gap-2">
                      {(["cash", "wallet", "card"] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setPayMethod(m)}
                          className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                            payMethod === m
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                              : "border-slate-700 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Promo Code (optional)</label>
                    <input
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME20"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="rounded-lg bg-slate-800/60 p-3 flex justify-between text-sm">
                    <span className="text-slate-400">Amount Due</span>
                    <span className="font-bold text-emerald-400">₨{Number(ride.fare_amount).toLocaleString()}</span>
                  </div>

                  <button
                    onClick={submitPayment}
                    disabled={paying}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {paying ? "Processing..." : `Pay ₨${Number(ride.fare_amount).toLocaleString()}`}
                  </button>

                  {payMessage && (
                    <p className={`text-sm text-center ${payMessage.includes("failed") ? "text-red-400" : "text-emerald-400"}`}>
                      {payMessage}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-red-400 font-medium">This ride was cancelled.</p>
          </div>
        )}

        {/* Rating section — rider rates the driver after ride is completed */}
        {isCompleted && ride.driver_user_id && (
          <RatingWidget
            rideId={ride.ride_id}
            ratedUserId={ride.driver_user_id}
            ratedUserName={ride.driver_name ?? "your driver"}
            label="Rate your driver"
          />
        )}
      </div>
    </PageShell>
  );
}
