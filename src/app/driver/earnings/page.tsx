"use client";

import { useEffect, useState } from "react";

type Earning = { earning_id: number; net_earning: number; earned_at: string };

export default function Page() {
  const [rows, setRows] = useState<Earning[]>([]);

  useEffect(() => {
    fetch("/api/reports/earnings")
      .then((res) => res.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <h1 className="text-2xl">Driver Earnings</h1>
      <div className="mt-4 space-y-2">
        {rows.map((e) => (
          <div key={e.earning_id} className="rounded border border-slate-800 p-3">
            #{e.earning_id} - Net Rs.{e.net_earning}
          </div>
        ))}
      </div>
    </main>
  );
}
