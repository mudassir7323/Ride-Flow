"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/shared/PageShell";
import { TrendingUp, Award, Power, Wallet } from "lucide-react";

export default function DriverDashboard() {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [stats, setStats] = useState({ rating: 0, totalEarnings: 0, trips: 0 });

  useEffect(() => {
    fetch("/api/reports/earnings")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const total = data.reduce((acc: number, curr: any) => acc + Number(curr.net_earning), 0);
          setStats(prev => ({ ...prev, totalEarnings: total, trips: data.length }));
        }
      });

    if (session?.user?.driverId) {
      fetch(`/api/drivers/${session.user.driverId}`)
        .then(res => res.json())
        .then(data => {
          setIsOnline(data.availability_status === "online");
          setStats(prev => ({ ...prev, rating: Number(data.average_rating) || 0 }));
        });
    }
  }, [session?.user?.driverId]);

  async function toggleOnline() {
    if (!session?.user?.driverId) return;
    setTogglingOnline(true);
    const newStatus = isOnline ? "offline" : "online";
    const res = await fetch(`/api/drivers/${session.user.driverId}/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability_status: newStatus }),
    });
    if (res.ok) setIsOnline(!isOnline);
    setTogglingOnline(false);
  }

  return (
    <PageShell title="Driver Center" subtitle="Manage your schedule, track earnings, and view requests.">
      {/* Online toggle */}
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-4">
          <div className={`h-3 w-3 rounded-full transition-all ${isOnline ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-slate-600"}`} />
          <div>
            <p className="text-lg font-semibold">{isOnline ? "You are Online" : "You are Offline"}</p>
            <p className="text-sm text-slate-400">{isOnline ? "Active and ready for requests" : "Switch online to start earning"}</p>
          </div>
        </div>
        <button
          onClick={toggleOnline}
          disabled={togglingOnline}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-50 ${
            isOnline ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          <Power className="h-4 w-4" />
          {togglingOnline ? "Updating..." : isOnline ? "Go Offline" : "Go Online"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <DriverStat
          title="Total Earnings"
          value={`₨${stats.totalEarnings.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Wallet className="text-indigo-400" />}
        />
        <DriverStat
          title="Total Trips"
          value={stats.trips.toString()}
          icon={<TrendingUp className="text-emerald-400" />}
        />
        <DriverStat
          title="Rating"
          value={stats.rating > 0 ? `${stats.rating.toFixed(1)} ★` : "N/A"}
          icon={<Award className="text-amber-400" />}
        />
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Link href="/driver/requests" className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:bg-slate-900/60 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">New Requests</h3>
              <p className="mt-2 text-slate-400">View and accept nearby passenger requests.</p>
            </div>
            <div className="rounded-full bg-slate-800 p-4 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-indigo-400 text-sm font-bold">
            Check availability <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        <Link href="/driver/earnings" className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:bg-slate-900/60 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Earnings History</h3>
              <p className="mt-2 text-slate-400">Detailed breakdown of your earnings.</p>
            </div>
            <div className="rounded-full bg-slate-800 p-4 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-bold">
            View reports <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>
    </PageShell>
  );
}

function DriverStat({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-3 opacity-60 mb-3">
        {icon}
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
