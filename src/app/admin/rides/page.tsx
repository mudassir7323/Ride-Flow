"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { RideStatusBadge } from "@/components/rides/RideStatusBadge";
import { Search } from "lucide-react";

type Ride = {
  ride_id: number;
  rider_id: number;
  driver_id: number | null;
  ride_status: string;
  request_time: string;
  fare_amount: number | null;
  pickup_city: string;
};

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("ride_status", statusFilter);
    if (cityFilter) params.set("city", cityFilter);
    const res = await fetch(`/api/rides?${params}`);
    const data = await res.json();
    setRides(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter, cityFilter]);

  return (
    <PageShell title="Ride Management" subtitle="Monitor all rides across the platform.">
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="requested">Requested</option>
          <option value="accepted">Accepted</option>
          <option value="en_route">En Route</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            placeholder="Filter by city..."
            className="rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">Ride ID</th>
              <th className="px-4 py-3 font-medium text-slate-500">Rider</th>
              <th className="px-4 py-3 font-medium text-slate-500">Driver</th>
              <th className="px-4 py-3 font-medium text-slate-500">City</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">Fare</th>
              <th className="px-4 py-3 font-medium text-slate-500">Requested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-slate-500">Loading...</td></tr>
            ) : rides.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-slate-500">No rides found.</td></tr>
            ) : rides.map(ride => (
              <tr key={ride.ride_id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-mono text-slate-500">#RID-{ride.ride_id}</td>
                <td className="px-4 py-3 text-slate-300">#{ride.rider_id}</td>
                <td className="px-4 py-3 text-slate-400">{ride.driver_id ? `#${ride.driver_id}` : "—"}</td>
                <td className="px-4 py-3 text-slate-400">{ride.pickup_city}</td>
                <td className="px-4 py-3"><RideStatusBadge status={ride.ride_status} /></td>
                <td className="px-4 py-3 font-medium text-indigo-400">
                  {ride.fare_amount != null ? `₨${Number(ride.fare_amount).toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(ride.request_time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
