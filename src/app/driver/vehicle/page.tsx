"use client";

import { FormEvent, useState } from "react";

export default function Page() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      make: formData.get("make"),
      model: formData.get("model"),
      year: Number(formData.get("year")),
      color: formData.get("color"),
      license_plate: formData.get("license_plate"),
      vehicle_type: formData.get("vehicle_type"),
    };
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMessage(res.ok ? `Vehicle added: ${data.vehicle_id}` : data.error ?? "Failed");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <h1 className="text-2xl">Driver Vehicle</h1>
      <form onSubmit={onSubmit} className="mt-4 grid max-w-2xl gap-3 md:grid-cols-2">
        <input name="make" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Make" required />
        <input name="model" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Model" required />
        <input name="year" type="number" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Year" required />
        <input name="color" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="Color" required />
        <input name="license_plate" className="rounded border border-slate-700 bg-slate-900 p-2" placeholder="License plate" required />
        <select name="vehicle_type" className="rounded border border-slate-700 bg-slate-900 p-2">
          <option value="economy">economy</option>
          <option value="premium">premium</option>
          <option value="bike">bike</option>
        </select>
        <button type="submit" className="rounded bg-indigo-500 px-4 py-2 text-sm md:col-span-2">Save Vehicle</button>
      </form>
      {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
    </main>
  );
}
