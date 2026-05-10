"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/shared/PageShell";
import { Search, Clock, MapPin, Navigation, Star, ShieldCheck } from "lucide-react";
import { RideStatusBadge } from "@/components/rides/RideStatusBadge";

export default function RiderDashboard() {
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rides/history")
      .then(res => res.json())
      .then(data => {
        setRecentRides(data.data?.slice(0, 3) || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageShell 
      title="Hello, Rider!" 
      subtitle="Where would you like to go today?"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold">Request a Ride</h3>
              <p className="mt-2 text-indigo-100 max-w-sm">
                Get a comfortable and safe ride in minutes. Professional drivers available 24/7.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link 
                  href="/rider/rides/new" 
                  className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Book Now
                </Link>
                <Link 
                  href="/rider/rides" 
                  className="rounded-xl bg-indigo-500/50 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500/70 transition-colors backdrop-blur-sm"
                >
                  Schedule for Later
                </Link>
              </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <Navigation size={200} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Your Recent Rides</h3>
              <Link href="/rider/rides" className="text-sm font-medium text-indigo-400 hover:underline">
                View all history
              </Link>
            </div>
            
            <div className="grid gap-4">
              {loading ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
              ) : recentRides.length > 0 ? (
                recentRides.map((ride: any) => (
                  <div key={ride.ride_id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-hover hover:bg-slate-900">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-slate-800 p-3">
                        <Clock className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">Ride #{ride.ride_id}</p>
                        <p className="text-sm text-slate-500">{new Date(ride.request_time).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-400">₨{ride.fare || ride.fare_amount}</p>
                      <RideStatusBadge status={ride.ride_status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-500">
                  No previous rides found. Start your first journey today!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Safety Center
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your safety is our priority. Share your ride status with family or contact emergency support.
            </p>
            <button className="mt-4 w-full rounded-lg bg-slate-800 py-2 text-sm font-medium hover:bg-slate-700 transition-colors">
              Explore Safety Tools
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              Rewards
            </h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">450</span>
              <span className="text-sm text-slate-500 mb-1">Points</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
              <div className="h-full w-2/3 rounded-full bg-amber-400" />
            </div>
            <p className="mt-2 text-xs text-slate-500 italic">50 more points for a free voucher!</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
