"use client";

import {
  ApiError,
  createTransaction,
  deleteTransaction,
  getCategories,
  getTransactions,
  updateTransaction,
} from "@/lib/api";
import { getCurrentRole } from "@/lib/auth";
import {
  CategoryPublic,
  TransactionPublic,
  TransactionType,
} from "@/types/finance";
import { useCallback, useEffect, useMemo, useState } from "react";

function toCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function toInputDate(value: string): string {
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toIsoDate(dateOnly: string): string {
  return new Date(`${dateOnly}T12:00:00Z`).toISOString();
}

export default function TransactionsPage() {
  const role = getCurrentRole();
  const canManage = role === "admin";

  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [transactions, setTransactions] = useState<TransactionPublic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    amount: "",
    type: "expense" as TransactionType,
    category_id: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryResponse, transactionResponse] = await Promise.all([
        getCategories({ limit: 500 }),
        getTransactions({
          limit: 500,
          type: typeFilter === "all" ? undefined : typeFilter,
          category_id: categoryFilter === "all" ? undefined : categoryFilter,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
      ]);

      setCategories(categoryResponse.data);
      setTransactions(transactionResponse.data);

      setForm((prev) => ({
        ...prev,
        category_id: prev.category_id || categoryResponse.data[0]?.id || "",
      }));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load transactions.");
      }
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) return;
    setError(null);

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      if (editId) {
        await updateTransaction(editId, {
          amount,
          type: form.type,
          category_id: form.category_id,
          note: form.note,
          date: toIsoDate(form.date),
        });
      } else {
        await createTransaction({
          amount,
          type: form.type,
          category_id: form.category_id,
          note: form.note,
          date: toIsoDate(form.date),
        });
      }

      setEditId(null);
      setForm((prev) => ({
        ...prev,
        amount: "",
        note: "",
        date: new Date().toISOString().slice(0, 10),
      }));
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to save transaction.");
      }
    }
  }

  async function onDelete(transactionId: string) {
    if (!canManage) return;
    try {
      await deleteTransaction(transactionId);
      await loadData();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete transaction.");
      }
    }
  }

  function onEdit(transaction: TransactionPublic) {
    setEditId(transaction.id);
    setForm({
      amount: String(transaction.amount),
      type: transaction.type,
      category_id: transaction.category_id,
      note: transaction.note || "",
      date: toInputDate(transaction.date),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Filter and manage income/expense entries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | TransactionType)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      {canManage ? (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-6 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            placeholder="Amount"
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

          <select
            value={form.category_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category_id: e.target.value }))
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            required
          >
            {categories
              .filter((category) => category.type === form.type)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            required
          />

          <input
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Note"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />

          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {editId ? "Update" : "Add"}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          You are in read-only mode. Only admins can create, update, or delete
          transactions.
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
            Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-white/90">
                    Note
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/90">
                    Amount
                  </th>
                  {canManage ? (
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-white/90">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {toDisplayDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-800 dark:text-white/90">
                      {transaction.type}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {categoryMap.get(transaction.category_id)?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {transaction.note || "-"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {toCurrency(transaction.amount)}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onEdit(transaction)}
                          className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white/90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManage ? 6 : 5}
                      className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No transactions found.
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
