"use client";

import { useEffect, useState, FormEvent } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

type Promo = {
  promo_id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  expiry_date: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/promo-codes");
    const data = await res.json();
    setPromos(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(promo: Promo) {
    await fetch(`/api/promo-codes/${promo.promo_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !promo.is_active }),
    });
    load();
  }

  async function deletePromo(id: number) {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/promo-codes/${id}`, { method: "DELETE" });
    load();
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      code: fd.get("code"),
      discount_type: fd.get("discount_type"),
      discount_value: Number(fd.get("discount_value")),
      expiry_date: fd.get("expiry_date"),
      usage_limit: Number(fd.get("usage_limit")),
    };
    const res = await fetch("/api/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      load();
    } else {
      const data = await res.json();
      setFormError(data.error ?? "Failed to create promo.");
    }
  }

  return (
    <PageShell title="Promo Codes" subtitle="Create and manage discount codes.">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          New Promo Code
        </button>
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="mb-6 rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h3 className="mb-4 font-semibold text-slate-100">Create Promo Code</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              name="code"
              required
              placeholder="Code (e.g. SAVE20)"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
            />
            <select
              name="discount_type"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₨)</option>
            </select>
            <input
              name="discount_value"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="Discount value"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              name="expiry_date"
              type="date"
              required
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              name="usage_limit"
              type="number"
              min="1"
              defaultValue={100}
              required
              placeholder="Usage limit"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {formError && <p className="mt-2 text-sm text-red-400">{formError}</p>}
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">Code</th>
              <th className="px-4 py-3 font-medium text-slate-500">Type</th>
              <th className="px-4 py-3 font-medium text-slate-500">Value</th>
              <th className="px-4 py-3 font-medium text-slate-500">Expiry</th>
              <th className="px-4 py-3 font-medium text-slate-500">Usage</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-slate-500">Loading...</td></tr>
            ) : promos.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-slate-500">No promo codes found.</td></tr>
            ) : promos.map(promo => (
              <tr key={promo.promo_id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-mono font-bold text-indigo-400">{promo.code}</td>
                <td className="px-4 py-3 capitalize text-slate-400">{promo.discount_type}</td>
                <td className="px-4 py-3 font-medium text-slate-100">
                  {promo.discount_type === "percentage"
                    ? `${promo.discount_value}%`
                    : `₨${promo.discount_value}`}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(promo.expiry_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {promo.used_count} / {promo.usage_limit}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${promo.is_active ? "bg-emerald-400/10 text-emerald-400" : "bg-slate-400/10 text-slate-400"}`}>
                    {promo.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(promo)}
                      title={promo.is_active ? "Deactivate" : "Activate"}
                      className={`rounded p-1 ${promo.is_active ? "text-amber-400 hover:bg-amber-400/10" : "text-emerald-400 hover:bg-emerald-400/10"}`}
                    >
                      {promo.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deletePromo(promo.promo_id)}
                      title="Delete"
                      className="rounded p-1 text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
