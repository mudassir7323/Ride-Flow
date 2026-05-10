"use client";

import { useEffect, useState } from "react";
import { RideStatusBadge } from "@/components/rides/RideStatusBadge";

type Ride = { ride_id: number; ride_status: string; request_time: string };

export default function Page() {
  const [rows, setRows] = useState<Ride[]>([]);

  useEffect(() => {
    fetch("/api/rides/history")
      .then((res) => res.json())
      .then((data) => setRows(data.data ?? []))
      .catch(() => setRows([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <h1 className="text-2xl">Rider Ride History</h1>
      <div className="mt-4 space-y-2">
        {rows.map((ride) => (
          <div key={ride.ride_id} className="flex items-center justify-between rounded border border-slate-800 p-3">
            <span>Ride #{ride.ride_id}</span>
            <RideStatusBadge status={ride.ride_status} />
          </div>
        ))}
      </div>
    </main>
  );
}
