"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";

type Complaint = {
  complaint_id: number;
  ride_id: number;
  complainant_name: string;
  against_name: string;
  complaint_text: string;
  complaint_status: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-400/10 text-red-400",
  under_review: "bg-amber-400/10 text-amber-400",
  resolved: "bg-emerald-400/10 text-emerald-400",
  dismissed: "bg-slate-400/10 text-slate-400",
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/complaints");
    const data = await res.json();
    setComplaints(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/complaints/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint_status: status }),
    });
    load();
  }

  return (
    <PageShell title="Complaints" subtitle="Review and resolve user complaints.">
      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading...</div>
        ) : complaints.length === 0 ? (
          <div className="rounded-xl border border-slate-800 py-10 text-center text-slate-500">
            No complaints found.
          </div>
        ) : complaints.map(c => (
          <div key={c.complaint_id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs text-slate-500">#C-{c.complaint_id}</span>
                  <span className="text-xs text-slate-500">Ride #{c.ride_id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.complaint_status] ?? ""}`}>
                    {c.complaint_status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-1">
                  <span className="font-medium text-slate-100">{c.complainant_name}</span>
                  <span className="text-slate-500"> against </span>
                  <span className="font-medium text-slate-100">{c.against_name}</span>
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">{c.complaint_text}</p>
                <p className="mt-2 text-xs text-slate-600">{new Date(c.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {c.complaint_status === "open" && (
                  <button
                    onClick={() => updateStatus(c.complaint_id, "under_review")}
                    className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                  >
                    Review
                  </button>
                )}
                {c.complaint_status !== "resolved" && (
                  <button
                    onClick={() => updateStatus(c.complaint_id, "resolved")}
                    className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"
                  >
                    Resolve
                  </button>
                )}
                {c.complaint_status !== "dismissed" && (
                  <button
                    onClick={() => updateStatus(c.complaint_id, "dismissed")}
                    className="rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
