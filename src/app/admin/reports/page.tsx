"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { TrendingUp, DollarSign, Award } from "lucide-react";

type RevenueRow = {
  date: string;
  city: string;
  total_rides: number;
  gross_revenue: number;
  platform_commission: number;
  total_discounts: number;
  card_payments: number;
  cash_payments: number;
  wallet_payments: number;
};

type LeaderboardRow = {
  driver_id: number;
  full_name: string;
  city: string;
  city_rank: number;
  total_trips: number;
  average_rating: number;
  total_earnings: number;
};

type EarningRow = {
  earning_id: number;
  driver_id: number;
  ride_id: number;
  gross_amount: number;
  commission_amount: number;
  net_earning: number;
  earned_at: string;
};

export default function AdminReportsPage() {
  const [tab, setTab] = useState<"revenue" | "leaderboard" | "earnings">("revenue");
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [earnings, setEarnings] = useState<EarningRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function loadRevenue() {
    setLoading(true);
    const params = new URLSearchParams();
    if (cityFilter) params.set("city", cityFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const res = await fetch(`/api/reports/revenue?${params}`);
    const data = await res.json();
    setRevenue(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function loadLeaderboard() {
    setLoading(true);
    const res = await fetch("/api/reports/leaderboard");
    const data = await res.json();
    setLeaderboard(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function loadEarnings() {
    setLoading(true);
    const res = await fetch("/api/reports/earnings");
    const data = await res.json();
    setEarnings(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === "revenue") loadRevenue();
    else if (tab === "leaderboard") loadLeaderboard();
    else loadEarnings();
  }, [tab, cityFilter, fromDate, toDate]);

  const totalRevenue = revenue.reduce((s, r) => s + Number(r.gross_revenue), 0);
  const totalCommission = revenue.reduce((s, r) => s + Number(r.platform_commission), 0);
  const totalRides = revenue.reduce((s, r) => s + Number(r.total_rides), 0);

  return (
    <PageShell title="Reports & Analytics" subtitle="Platform-wide financial and performance data.">
      {/* Tab switcher */}
      <div className="mb-6 flex gap-2 border-b border-slate-800 pb-0">
        {(["revenue", "leaderboard", "earnings"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {tab === "revenue" && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <input
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              placeholder="Filter by city..."
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">₨{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Platform Commission</span>
              </div>
              <p className="text-2xl font-bold text-indigo-400">₨{totalCommission.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Award className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Rides</span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{totalRides.toLocaleString()}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-500">City</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Rides</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Revenue</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Commission</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Discounts</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Cash/Card/Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-slate-500">Loading...</td></tr>
                ) : revenue.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-slate-500">No revenue data found.</td></tr>
                ) : revenue.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-slate-300">{row.city}</td>
                    <td className="px-4 py-3 text-slate-300">{row.total_rides}</td>
                    <td className="px-4 py-3 font-medium text-emerald-400">₨{Number(row.gross_revenue).toLocaleString()}</td>
                    <td className="px-4 py-3 text-indigo-400">₨{Number(row.platform_commission).toLocaleString()}</td>
                    <td className="px-4 py-3 text-amber-400">₨{Number(row.total_discounts).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">{row.cash_payments}/{row.card_payments}/{row.wallet_payments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Leaderboard Tab */}
      {tab === "leaderboard" && (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">Rank</th>
                <th className="px-4 py-3 font-medium text-slate-500">Driver</th>
                <th className="px-4 py-3 font-medium text-slate-500">City</th>
                <th className="px-4 py-3 font-medium text-slate-500">Trips</th>
                <th className="px-4 py-3 font-medium text-slate-500">Rating</th>
                <th className="px-4 py-3 font-medium text-slate-500">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">Loading...</td></tr>
              ) : leaderboard.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">No leaderboard data.</td></tr>
              ) : leaderboard.map((row, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <span className={`font-bold ${row.city_rank === 1 ? "text-amber-400" : row.city_rank === 2 ? "text-slate-300" : row.city_rank === 3 ? "text-amber-700" : "text-slate-500"}`}>
                      #{row.city_rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-100">{row.full_name}</td>
                  <td className="px-4 py-3 text-slate-400">{row.city}</td>
                  <td className="px-4 py-3 text-slate-300">{row.total_trips}</td>
                  <td className="px-4 py-3 text-amber-400">{Number(row.average_rating).toFixed(1)} ★</td>
                  <td className="px-4 py-3 font-medium text-emerald-400">₨{Number(row.total_earnings).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Earnings Tab */}
      {tab === "earnings" && (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">ID</th>
                <th className="px-4 py-3 font-medium text-slate-500">Driver</th>
                <th className="px-4 py-3 font-medium text-slate-500">Ride</th>
                <th className="px-4 py-3 font-medium text-slate-500">Gross</th>
                <th className="px-4 py-3 font-medium text-slate-500">Commission</th>
                <th className="px-4 py-3 font-medium text-slate-500">Net</th>
                <th className="px-4 py-3 font-medium text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-500">Loading...</td></tr>
              ) : earnings.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-500">No earnings data.</td></tr>
              ) : earnings.map(e => (
                <tr key={e.earning_id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-slate-500">#{e.earning_id}</td>
                  <td className="px-4 py-3 text-slate-400">#{e.driver_id}</td>
                  <td className="px-4 py-3 text-slate-400">#{e.ride_id}</td>
                  <td className="px-4 py-3 text-slate-300">₨{Number(e.gross_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-400">-₨{Number(e.commission_amount).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-emerald-400">₨{Number(e.net_earning).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(e.earned_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
