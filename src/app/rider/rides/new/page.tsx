"use client";

import { FormEvent, useState } from "react";

export default function Page() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      pickup: {
        address: formData.get("pickup_address"),
        city: formData.get("pickup_city"),
        lat: Number(formData.get("pickup_lat")),
        lng: Number(formData.get("pickup_lng")),
      },
      dropoff: {
        address: formData.get("dropoff_address"),
        city: formData.get("dropoff_city"),
        lat: Number(formData.get("dropoff_lat")),
        lng: Number(formData.get("dropoff_lng")),
      },
      vehicle_type: formData.get("vehicle_type"),
      scheduled_time: formData.get("scheduled_time") || undefined,
    };
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setMessage(res.ok ? `Ride created: ${json.ride_id}` : json.error ?? "Request failed");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <h1 className="text-2xl">Book Ride</h1>
      <form onSubmit={onSubmit} className="mt-4 grid max-w-3xl gap-3 md:grid-cols-2">
        <input name="pickup_address" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Pickup address" required />
        <input name="pickup_city" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Pickup city" required />
        <input name="pickup_lat" type="number" step="any" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Pickup lat" required />
        <input name="pickup_lng" type="number" step="any" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Pickup lng" required />
        <input name="dropoff_address" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Dropoff address" required />
        <input name="dropoff_city" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Dropoff city" required />
        <input name="dropoff_lat" type="number" step="any" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Dropoff lat" required />
        <input name="dropoff_lng" type="number" step="any" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Dropoff lng" required />
        <select name="vehicle_type" className="rounded border border-slate-700 bg-slate-900 p-2">
          <option value="economy">economy</option>
          <option value="premium">premium</option>
          <option value="bike">bike</option>
        </select>
        <input name="scheduled_time" type="datetime-local" className="rounded border border-slate-700 bg-slate-900 p-2" />
        <button className="rounded bg-indigo-500 px-4 py-2 text-sm md:col-span-2" type="submit">Request Ride</button>
      </form>
      {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
    </main>
  );
}
