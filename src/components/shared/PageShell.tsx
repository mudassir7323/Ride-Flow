"use client";

import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

const NAV_LINKS: Record<string, { label: string; href: string }[]> = {
  rider: [
    { label: "Dashboard", href: "/rider/dashboard" },
    { label: "Book Ride", href: "/rider/rides/new" },
    { label: "My Rides", href: "/rider/rides" },
    { label: "Payments", href: "/rider/payments" },
  ],
  driver: [
    { label: "Dashboard", href: "/driver/dashboard" },
    { label: "Requests", href: "/driver/requests" },
    { label: "Earnings", href: "/driver/earnings" },
    { label: "Vehicle", href: "/driver/vehicle" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Drivers", href: "/admin/drivers" },
    { label: "Rides", href: "/admin/rides" },
    { label: "Complaints", href: "/admin/complaints" },
    { label: "Promos", href: "/admin/promos" },
    { label: "Reports", href: "/admin/reports" },
  ],
};

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "rider";
  const links = NAV_LINKS[role] ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Brand */}
          <Link href="/" className="text-lg font-bold text-indigo-400 tracking-tight">
            RideFlow
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <User className="h-4 w-4" />
              <span>{session?.user?.name ?? "User"}</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-400 capitalize">
                {role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
