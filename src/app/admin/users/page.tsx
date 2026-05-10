"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/shared/PageShell";
import { Search, UserCheck, UserX, Trash2 } from "lucide-react";

type User = {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  account_status: string;
  registration_date: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-400",
  suspended: "bg-amber-400/10 text-amber-400",
  banned: "bg-red-400/10 text-red-400",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-400/10 text-purple-400",
  driver: "bg-blue-400/10 text-blue-400",
  rider: "bg-slate-400/10 text-slate-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [search, roleFilter, statusFilter]);

  async function updateStatus(userId: number, status: string) {
    await fetch(`/api/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_status: status }),
    });
    load();
  }

  async function deleteUser(userId: number) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await fetch(`/api/users/${userId}`, { method: "DELETE" });
    load();
  }

  return (
    <PageShell title="User Management" subtitle="View and manage all platform users.">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="rider">Rider</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">ID</th>
              <th className="px-4 py-3 font-medium text-slate-500">Name</th>
              <th className="px-4 py-3 font-medium text-slate-500">Email</th>
              <th className="px-4 py-3 font-medium text-slate-500">Phone</th>
              <th className="px-4 py-3 font-medium text-slate-500">Role</th>
              <th className="px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 font-medium text-slate-500">Registered</th>
              <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={8} className="py-10 text-center text-slate-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-slate-500">No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user.user_id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-mono text-slate-500">#{user.user_id}</td>
                <td className="px-4 py-3 font-medium text-slate-100">{user.full_name}</td>
                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                <td className="px-4 py-3 text-slate-400">{user.phone}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] ?? ""}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[user.account_status] ?? ""}`}>
                    {user.account_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(user.registration_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {user.account_status !== "active" && (
                      <button
                        onClick={() => updateStatus(user.user_id, "active")}
                        title="Activate"
                        className="rounded p-1 text-emerald-400 hover:bg-emerald-400/10"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    )}
                    {user.account_status === "active" && (
                      <button
                        onClick={() => updateStatus(user.user_id, "suspended")}
                        title="Suspend"
                        className="rounded p-1 text-amber-400 hover:bg-amber-400/10"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(user.user_id)}
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
