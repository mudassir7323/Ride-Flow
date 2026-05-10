"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  // If already logged in, redirect immediately
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      redirectByRole(session.user.role);
    }
  }, [session, status]);

  function redirectByRole(role: string) {
    if (role === "admin") router.replace("/admin/dashboard");
    else if (role === "driver") router.replace("/driver/dashboard");
    else router.replace("/rider/dashboard");
  }

  async function onSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.ok) {
      setMessage("Login successful. Redirecting...");
      // Session will update and the useEffect above will redirect
    } else {
      setMessage("Invalid email or password.");
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-md rounded-lg border border-slate-800 p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <form action={onSubmit} className="mt-4 grid gap-3">
          <input name="email" type="email" placeholder="Email" className="rounded border border-slate-700 bg-slate-900 p-2" />
          <input name="password" type="password" placeholder="Password" className="rounded border border-slate-700 bg-slate-900 p-2" />
          <button className="rounded bg-indigo-500 px-4 py-2 text-sm" type="submit">
            Sign In
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
      </div>
    </main>
  );
}
