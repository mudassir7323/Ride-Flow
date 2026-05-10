"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [message, setMessage] = useState("");

  async function onSubmit(formData: FormData) {
    const body = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role: formData.get("role"),
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessage(res.ok ? "Registration successful." : "Registration failed.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-md rounded-lg border border-slate-800 p-6">
        <h1 className="text-2xl font-semibold">Register</h1>
        <form action={onSubmit} className="mt-4 grid gap-3">
          <input name="full_name" placeholder="Full name" className="rounded border border-slate-700 bg-slate-900 p-2" />
          <input name="email" type="email" placeholder="Email" className="rounded border border-slate-700 bg-slate-900 p-2" />
          <input name="phone" placeholder="Phone" className="rounded border border-slate-700 bg-slate-900 p-2" />
          <input name="password" type="password" placeholder="Password" className="rounded border border-slate-700 bg-slate-900 p-2" />
          <select name="role" className="rounded border border-slate-700 bg-slate-900 p-2">
            <option value="rider">Rider</option>
            <option value="driver">Driver</option>
          </select>
          <button className="rounded bg-indigo-500 px-4 py-2 text-sm" type="submit">
            Create Account
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
      </div>
    </main>
  );
}
