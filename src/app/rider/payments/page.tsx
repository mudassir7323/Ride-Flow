"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import Link from "next/link";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

type Payment = {
  payment_id: number;
  ride_id: number;
  amount: number;
  discount_applied: number;
  payment_status: string;
  payment_method: string;
  transaction_date: string;
};

const STATUS_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  paid:     { color: "bg-emerald-400/10 text-emerald-400", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  pending:  { color: "bg-amber-400/10 text-amber-400",    icon: <Clock className="h-3.5 w-3.5" /> },
  failed:   { color: "bg-red-400/10 text-red-400",        icon: <XCircle className="h-3.5 w-3.5" /> },
  refunded: { color: "bg-blue-400/10 text-blue-400",      icon: <CreditCard className="h-3.5 w-3.5" /> },
};

const METHOD_LABELS: Record<string, string> = {
  cash: "💵 Cash",
  card: "💳 Card",
  wallet: "👛 Wallet",
};

export default function RiderPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then(res => res.json())
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments
    .filter(p => p.payment_status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);

  const totalPending = payments
    .filter(p => p.payment_status === "pending")
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <PageShell title="Payment History" subtitle="All your ride payments in one place.">
      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Paid</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">₨{totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">₨{totalPending.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Rides</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{payments.length}</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-16 text-center">
          <CreditCard className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">No payments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => {
            const style = STATUS_STYLES[p.payment_status] ?? STATUS_STYLES.pending;
            return (
              <div
                key={p.payment_id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-slate-800 p-2.5">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-100">Ride #{p.ride_id}</p>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.color}`}>
                        {style.icon}
                        {p.payment_status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {METHOD_LABELS[p.payment_method] ?? p.payment_method}
                      {" · "}
                      {new Date(p.transaction_date).toLocaleDateString()}
                    </p>
                    {Number(p.discount_applied) > 0 && (
                      <p className="text-xs text-indigo-400 mt-0.5">
                        Discount applied: ₨{Number(p.discount_applied).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-slate-100">₨{Number(p.amount).toLocaleString()}</p>
                  {p.payment_status === "pending" && (
                    <Link
                      href={`/rider/rides/${p.ride_id}`}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Pay now →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
