"use client";

import {
  ApiError,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api";
import { getCurrentRole } from "@/lib/auth";
import { CategoryPublic, TransactionType } from "@/types/finance";
import { useEffect, useMemo, useState } from "react";

export default function CategoriesPage() {
  const role = getCurrentRole();
  const canManage = role === "admin";

  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");

  const [form, setForm] = useState({
    name: "",
    type: "expense" as TransactionType,
  });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategories({ limit: 500 });
      setCategories(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load categories.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const visibleCategories = useMemo(() => {
    if (typeFilter === "all") return categories;
    return categories.filter((item) => item.type === typeFilter);
  }, [categories, typeFilter]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) return;

    const name = form.name.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    setError(null);
    try {
      if (editId) {
        await updateCategory(editId, {
          name,
          type: form.type,
        });
      } else {
        await createCategory({
          name,
          type: form.type,
        });
      }

      setEditId(null);
      setForm({ name: "", type: "expense" });
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to save category.");
      }
    }
  }

  function onEdit(category: CategoryPublic) {
    setEditId(category.id);
    setForm({
      name: category.name,
      type: category.type,
    });
  }

  async function onDelete(categoryId: string) {
    if (!canManage) return;
    setError(null);
    try {
      await deleteCategory(categoryId);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete category.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Categories
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage income and expense categories used by transactions.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by type
        </label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | TransactionType)}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {canManage ? (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Category name"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            required
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value as TransactionType,
              }))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {editId ? "Update" : "Create"}
          </button>

          {editId ? (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({ name: "", type: "expense" });
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel edit
            </button>
          ) : null}
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          You are in read-only mode. Only admins can create, update, or delete
          categories.
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            Loading categories...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Type
                  </th>
                  {canManage ? (
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/90">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-800 dark:text-white/90">
                      {category.type}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onEdit(category)}
                          className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white/90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(category.id)}
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}

                {visibleCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 3 : 2}
                      className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No categories found.
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
