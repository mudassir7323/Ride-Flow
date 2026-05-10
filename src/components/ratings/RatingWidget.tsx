"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  rideId: number;
  ratedUserId: number;       // user_id of the person being rated
  ratedUserName: string;
  label: string;             // e.g. "Rate your driver" or "Rate your rider"
  onDone?: () => void;
}

export function RatingWidget({ rideId, ratedUserId, ratedUserName, label, onDone }: Props) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (score === 0) { setError("Please select a star rating."); return; }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ride_id: rideId, rated_user_id: ratedUserId, score, comment: comment || undefined }),
    });
    if (res.ok) {
      setSubmitted(true);
      onDone?.();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to submit rating.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`h-5 w-5 ${i <= score ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
          ))}
        </div>
        <p className="text-sm font-medium text-amber-400">Thanks for rating {ratedUserName}!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{ratedUserName}</p>
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            onClick={() => setScore(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                i <= (hovered || score)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-600"
              }`}
            />
          </button>
        ))}
        {score > 0 && (
          <span className="ml-2 self-center text-sm text-slate-400">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][score]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment (optional)..."
        rows={2}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || score === 0}
        className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}
