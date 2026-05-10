"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shared/PageShell";
import { RideStatusBadge } from "@/components/rides/RideStatusBadge";
import { MapPin, RefreshCw } from "lucide-react";

type Ride = {
  ride_id: number;
  ride_status: string;
  city: string;
  address: string;
  request_time: string;
  surge_multiplier: number;
};

export default function DriverRequestsPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<number | null>(null);
  const router = useRouter();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/rides/nearby");
    const data = await res.json();
    setRides(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  async function accept(rideId: number) {
    setAccepting(rideId);
    const res = await fetch(`/api/rides/${rideId}/accept`, { method: "POST" });
    if (res.ok) {
      router.push(`/driver/rides/${rideId}`);
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to accept ride. It may have been taken.");
      load();
    }
    setAccepting(null);
  }

  return (
    <PageShell title="Ride Requests" subtitle="Available rides near you. Refresh to see latest.">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{rides.length} ride{rides.length !== 1 ? "s" : ""} available</p>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : rides.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-16 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">No ride requests available right now.</p>
          <p className="text-sm text-slate-600 mt-1">Check back in a moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map(ride => (
            <div
              key={ride.ride_id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-indigo-500/10 p-2 mt-0.5">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-100">Ride #{ride.ride_id}</p>
                  <p className="text-sm text-slate-400">{ride.address}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ride.city} · {new Date(ride.request_time).toLocaleTimeString()}</p>
                  {ride.surge_multiplier > 1 && (
                    <span className="mt-1 inline-block rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                      {ride.surge_multiplier}x Surge
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RideStatusBadge status={ride.ride_status} />
                <button
                  onClick={() => accept(ride.ride_id)}
                  disabled={accepting === ride.ride_id}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {accepting === ride.ride_id ? "Accepting..." : "Accept"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
