"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type Driver = {
  driver_id: number;
  user_id: number;
  full_name: string;
  email: string;
  verification_status: string;
  availability_status: string;
  total_trips_completed: number;
  average_rating: number;
  wallet_balance: number;
};

const VERIFY_COLORS: Record<string, string> = {
  verified: "bg-emerald-400/10 text-emerald-400",
  pending: "bg-amber-400/10 text-amber-400",
  rejected: "bg-red-400/10 text-red-400",
};

const AVAIL_COLORS: Record<string, string> = {
  online: "bg-emerald-400/10 text-emerald-400",
  offline: "bg-slate-400/10 text-slate-400",
  on_trip: "bg-blue-400/10 text-blue-400",
};

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyFilter, setVerifyFilter] = useState("");
  const [availFilter, setAvailFilter] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (verifyFilter) params.set("verification_status", verifyFilter);
    if (availFilter) params.set("availability_status", availFilter);
    const res = await fetch(`/api/drivers?${params}`);
    const data = await res.json();
    setDrivers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [verifyFilter, availFilter]);

  async function verify(driverId: number, status: string) {
    await fetch(`/api/drivers/${driverId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_status: status }),
    });
    load();
  }

  return (
    <PageShell title="Driver Management" subtitle="Review and verify driver accounts.">
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={verifyFilter}
          onChange={e => setVerifyFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Verification</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={availFilter}
          onChange={e => setAvailFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Availability</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="on_trip">On Trip</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">ID</th>
              <th className="px-4 py-3 font-medium text-slate-500">Name</th>
              <th className="px-4 py-3 font-medium text-slate-500">Email</th>
              <th className="px-4 py-3 font-medium text-slate-500">Verification</th>
              <th className="px-4 py-3 font-medium text-slate-500">Availability</th>
              <th className="px-4 py-3 font-medium text-slate-500">Trips</th>
              <th className="px-4 py-3 font-medium text-slate-500">Rating</th>
              <th className="px-4 py-3 font-medium text-slate-500">Wallet</th>
              <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={9} className="py-10 text-center text-slate-500">Loading...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan={9} className="py-10 text-center text-slate-500">No drivers found.</td></tr>
            ) : drivers.map(driver => (
              <tr key={driver.driver_id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-mono text-slate-500">#{driver.driver_id}</td>
                <td className="px-4 py-3 font-medium text-slate-100">{driver.full_name}</td>
                <td className="px-4 py-3 text-slate-400">{driver.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${VERIFY_COLORS[driver.verification_status] ?? ""}`}>
                    {driver.verification_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${AVAIL_COLORS[driver.availability_status] ?? ""}`}>
                    {driver.availability_status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{driver.total_trips_completed}</td>
                <td className="px-4 py-3 text-amber-400">{Number(driver.average_rating).toFixed(1)} ★</td>
                <td className="px-4 py-3 text-emerald-400">₨{Number(driver.wallet_balance).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {driver.verification_status !== "verified" && (
                      <button
                        onClick={() => verify(driver.driver_id, "verified")}
                        title="Verify"
                        className="rounded p-1 text-emerald-400 hover:bg-emerald-400/10"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {driver.verification_status !== "rejected" && (
                      <button
                        onClick={() => verify(driver.driver_id, "rejected")}
                        title="Reject"
                        className="rounded p-1 text-red-400 hover:bg-red-400/10"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                    {driver.verification_status !== "pending" && (
                      <button
                        onClick={() => verify(driver.driver_id, "pending")}
                        title="Reset to Pending"
                        className="rounded p-1 text-amber-400 hover:bg-amber-400/10"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
