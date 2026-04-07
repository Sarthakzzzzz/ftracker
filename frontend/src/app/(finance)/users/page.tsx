"use client";

import {
  ApiError,
  createUser,
  deleteUser,
  getUsers,
  me,
  updateUser,
} from "@/lib/api";
import { getCurrentRole } from "@/lib/auth";
import { UserPublic, UserRole, UserStatus } from "@/types/finance";
import { useCallback, useEffect, useMemo, useState } from "react";

type UserFormState = {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
  is_superuser: boolean;
};

const DEFAULT_FORM: UserFormState = {
  email: "",
  full_name: "",
  password: "",
  role: "viewer",
  status: "active",
  is_active: true,
  is_superuser: false,
};

export default function UsersPage() {
  const role = getCurrentRole();
  const canManage = role === "admin";

  const [users, setUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<UserFormState>(DEFAULT_FORM);

  const loadData = useCallback(async () => {
    if (!canManage) {
      setError("You do not have permission to access user management.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [usersResponse, meResponse] = await Promise.all([
        getUsers({ limit: 500 }),
        me(),
      ]);
      setUsers(usersResponse.data);
      setCurrentUserId(meResponse.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (query.trim()) {
        const text = query.trim().toLowerCase();
        const haystack = `${user.email} ${user.full_name || ""}`.toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      return true;
    });
  }, [query, roleFilter, statusFilter, users]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) return;

    const email = form.email.trim().toLowerCase();
    const full_name = form.full_name.trim();

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!editId && form.password.length < 8) {
      setError("Password must be at least 8 characters for new users.");
      return;
    }

    setError(null);
    try {
      if (editId) {
        await updateUser(editId, {
          email,
          full_name: full_name || undefined,
          role: form.role,
          status: form.status,
          is_active: form.is_active,
          is_superuser: form.is_superuser,
          password: form.password.trim() ? form.password : undefined,
        });
      } else {
        await createUser({
          email,
          full_name: full_name || undefined,
          role: form.role,
          status: form.status,
          is_active: form.is_active,
          is_superuser: form.is_superuser,
          password: form.password,
        });
      }

      setEditId(null);
      setForm(DEFAULT_FORM);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to save user.");
      }
    }
  }

  function onEdit(user: UserPublic) {
    setEditId(user.id);
    setForm({
      email: user.email,
      full_name: user.full_name || "",
      password: "",
      role: user.role,
      status: user.status,
      is_active: user.is_active,
      is_superuser: user.is_superuser,
    });
  }

  async function onDelete(user: UserPublic) {
    if (!canManage) return;
    if (currentUserId && user.id === currentUserId) {
      setError("You cannot delete your own account.");
      return;
    }

    setError(null);
    try {
      await deleteUser(user.id);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete user.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Users
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage users, roles, and account status.
        </p>
      </div>

      {canManage ? (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            required
          />

          <input
            value={form.full_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, full_name: e.target.value }))
            }
            placeholder="Full name"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />

          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={editId ? "New password (optional)" : "Password (min 8 chars)"}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            required={!editId}
          />

          <select
            value={form.role}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="viewer">viewer</option>
            <option value="analyst">analyst</option>
            <option value="admin">admin</option>
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value as UserStatus }))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>

          <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-white/90">
            <label className="inline-flex items-center gap-2 text-gray-700 dark:text-white/90">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2 text-gray-700 dark:text-white/90">
              <input
                type="checkbox"
                checked={form.is_superuser}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_superuser: e.target.checked }))
                }
              />
              Superuser
            </label>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {editId ? "Update user" : "Create user"}
          </button>

          {editId ? (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(DEFAULT_FORM);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel edit
            </button>
          ) : null}
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          User management is restricted to admins.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email or name"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">All roles</option>
          <option value="viewer">Viewer</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | UserStatus)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Active
                  </th>
                  {canManage ? (
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/90">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {user.full_name || "-"}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-800 dark:text-white/90">
                      {user.role}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-800 dark:text-white/90">
                      {user.status}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {user.is_active ? "Yes" : "No"}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onEdit(user)}
                          className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white/90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(user)}
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500/20 dark:text-red-300"
                          disabled={currentUserId === user.id}
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 6 : 5}
                      className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
