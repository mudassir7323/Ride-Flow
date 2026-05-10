"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Users, Car, MapPin, DollarSign, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_rides: 0,
    active_drivers: 0,
    revenue: 0,
  });
  const [recentRides, setRecentRides] = useState([]);

  useEffect(() => {
    // Fetch stats
    fetch("/api/reports/stats")
      .then(res => res.json())
      .then(data => {
        setStats({
          total_users: data.total_users || 0,
          total_rides: data.total_rides || 0,
          active_drivers: data.active_drivers || 0,
          revenue: data.gross_revenue || 0,
        });
      });

    // Fetch rides
    fetch("/api/rides")
      .then(res => res.json())
      .then(data => setRecentRides(Array.isArray(data) ? data : []));
  }, []);

  return (
    <PageShell 
      title="Admin Dashboard" 
      subtitle="Overview of platform performance and active sessions."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.total_users.toLocaleString()} icon={<Users className="h-5 w-5 text-blue-400" />} change="+12%" />
        <StatCard title="Total Rides" value={stats.total_rides.toLocaleString()} icon={<MapPin className="h-5 w-5 text-green-400" />} change="+5.4%" />
        <StatCard title="Active Drivers" value={stats.active_drivers.toString()} icon={<Car className="h-5 w-5 text-amber-400" />} change="Stable" />
        <StatCard title="Revenue" value={`₨${stats.revenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5 text-emerald-400" />} change="+18.2%" />
      </div>

      <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900/50 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Platform Activity</h2>
          <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300">View all active rides</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Fare</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentRides.map((ride: any) => (
                <tr key={ride.ride_id} className="group hover:bg-slate-800/50">
                  <td className="py-4 font-mono text-slate-400">#RID-{ride.ride_id}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      ride.ride_status === 'completed' ? 'bg-green-400/10 text-green-400' :
                      ride.ride_status === 'pending' ? 'bg-amber-400/10 text-amber-400' :
                      'bg-slate-400/10 text-slate-400'
                    }`}>
                      {ride.ride_status}
                    </span>
                  </td>
                  <td className="py-4 font-medium text-slate-100">₨{ride.fare || ride.fare_amount}</td>
                  <td className="py-4 text-slate-500">{new Date(ride.request_time).toLocaleTimeString()}</td>
                </tr>
              ))}
              {recentRides.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

function StatCard({ title, value, icon, change }: { title: string, value: string, icon: React.ReactNode, change: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-slate-800 p-2">{icon}</div>
        <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-400' : 'text-slate-400'}`}>{change}</span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
