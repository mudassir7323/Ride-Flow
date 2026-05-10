"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MoveRight, Shield, Clock, MapPin } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "driver") router.replace("/driver/dashboard");
      else router.replace("/rider/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="relative isolate pt-14">
        {/* Background Gradients */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-indigo-400 ring-1 ring-slate-800 hover:ring-slate-700 transition-all">
                RideFlow v1.0 is now live. <Link href="/register" className="font-semibold text-white ml-1"><span className="absolute inset-0" />Read more <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Revolutionizing urban mobility for everyone.
            </h1>
            <p className="mt-8 text-lg leading-8 text-slate-400">
              Connect with nearest drivers, track your rides in real-time, and manage everything from a seamless interface. Built with precision for the DB Systems Lab.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/login"
                className="rounded-xl bg-indigo-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-all flex items-center gap-2 group"
              >
                Get Started
                <MoveRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/register" className="text-sm font-semibold leading-6 text-white hover:text-indigo-300 transition-colors">
                Create an account <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
               <FeatureCard 
                icon={<Shield className="text-emerald-400" />}
                title="Secure Payments"
                desc="End-to-end encrypted transactions for your peace of mind."
               />
               <FeatureCard 
                icon={<Clock className="text-amber-400" />}
                title="Real-time Tracking"
                desc="Never miss a ride with our live location synchronization."
               />
               <FeatureCard 
                icon={<MapPin className="text-blue-400" />}
                title="Smart Matching"
                desc="Our algorithms find the closest driver in seconds."
               />
               <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-sm border-dashed flex flex-col justify-center items-center text-center">
                 <p className="text-slate-500 text-sm">More features coming soon...</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:bg-slate-900/60 transition-all group backdrop-blur-sm">
      <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
