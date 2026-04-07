"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError, getDashboardSummary } from "@/lib/api";
import { useCurrentRole } from "@/lib/auth";
import DatePicker from "@/components/form/date-picker";
import { DashboardSummary } from "@/types/finance";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const PIE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#8b5cf6",
  "#14b8a6",
  "#ef4444",
  "#eab308",
];

function toCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function toDisplayDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [recentLimit, setRecentLimit] = useState(8);
  const [trendBy, setTrendBy] = useState<"monthly" | "weekly">("monthly");
  const role = useCurrentRole() ?? "viewer";
  const isAdmin = role === "admin";
  const categorySlices = useMemo(
    () => summary?.category_totals.filter((item) => item.total > 0).slice(0, 6) ?? [],
    [summary],
  );

  const cashflowSeries = useMemo(
    () => (summary ? [summary.total_income, summary.total_expense] : []),
    [summary],
  );

  const cashflowOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        height: 300,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      labels: ["Income", "Expense"],
      colors: ["#22c55e", "#ef4444"],
      stroke: { colors: ["transparent"] },
      legend: { position: "bottom" },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
          },
        },
      },
      dataLabels: {
        enabled: true,
      },
      tooltip: {
        y: {
          formatter: (value) => toCurrency(value),
        },
      },
    }),
    [],
  );

  const categoryPieSeries = useMemo(
    () => categorySlices.map((item) => item.total),
    [categorySlices],
  );

  const categoryPieOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "pie",
        height: 300,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      labels: categorySlices.map((item) => item.category_name),
      colors: PIE_COLORS,
      stroke: { colors: ["transparent"] },
      legend: { position: "bottom" },
      dataLabels: {
        enabled: true,
      },
      tooltip: {
        y: {
          formatter: (value) => toCurrency(value),
        },
      },
    }),
    [categorySlices],
  );

  const bestPeriod = useMemo(
    () =>
      summary?.trend.length
        ? summary.trend.reduce((best, current) =>
            current.net > best.net ? current : best,
          )
        : null,
    [summary],
  );

  const worstPeriod = useMemo(
    () =>
      summary?.trend.length
        ? summary.trend.reduce((worst, current) =>
            current.net < worst.net ? current : worst,
          )
        : null,
    [summary],
  );

  const topCategory = summary?.category_totals[0] ?? null;
  const topIncomeCategory =
    summary?.category_totals.find((item) => item.type === "income") ?? null;
  const topExpenseCategory =
    summary?.category_totals.find((item) => item.type === "expense") ?? null;
  const savingsRate =
    summary && summary.total_income > 0
      ? (summary.net_balance / summary.total_income) * 100
      : 0;
  const expenseRatio =
    summary && summary.total_income > 0
      ? (summary.total_expense / summary.total_income) * 100
      : 0;
  const averageCategorySize = summary?.category_totals.length
    ? summary.category_totals.reduce((sum, item) => sum + item.total, 0) /
      summary.category_totals.length
    : 0;
  const averageRecentTxn = summary?.recent_activity.length
    ? summary.recent_activity.reduce((sum, txn) => sum + txn.amount, 0) /
      summary.recent_activity.length
    : 0;

  const handleFromDateChange = useCallback((value: string) => {
    setError(null);
    setFromDate(value);
  }, []);

  const handleToDateChange = useCallback((value: string) => {
    setError(null);
    setToDate(value);
  }, []);

  const handleRecentLimitChange = (value: number) => {
    setError(null);
    setRecentLimit(value);
  };

  const handleTrendByChange = (value: "monthly" | "weekly") => {
    setError(null);
    setTrendBy(value);
  };

  useEffect(() => {
    let mounted = true;

    getDashboardSummary({
      trend_by: trendBy,
      recent_limit: recentLimit,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    })
      .then((data) => {
        if (!mounted) return;
        setSummary(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard summary.");
        }
      })
      .finally(() => {
        if (!mounted) return;
      });

    return () => {
      mounted = false;
    };
  }, [fromDate, recentLimit, toDate, trendBy]);

  const showInitialLoading = summary === null && !error;

  const chartSeries = useMemo(() => {
    if (!summary) return [];
    return [
      {
        name: "Income",
        data: summary.trend.map((point) => point.income),
      },
      {
        name: "Expense",
        data: summary.trend.map((point) => point.expense),
      },
      {
        name: "Net",
        data: summary.trend.map((point) => point.net),
      },
    ];
  }, [summary]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 340,
        toolbar: { show: false },
        fontFamily: "Outfit, sans-serif",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: summary?.trend.map((point) => point.period) || [],
      },
      yaxis: {
        labels: {
          formatter: (value) => `$${Math.round(value).toLocaleString()}`,
        },
      },
      legend: { position: "top" },
      colors: ["#22c55e", "#ef4444", "#3b82f6"],
      grid: { borderColor: "#e5e7eb" },
    }),
    [summary],
  );

  if (showInitialLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300">
        {error}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              Finance dashboard
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Role-aware overview for {role}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track income, expense, recent activity, and trend patterns from your backend summary API.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/transactions"
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50/60 dark:border-gray-800 dark:text-white/90 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
            >
              View transactions
            </Link>
            <Link
              href="/categories"
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50/60 dark:border-gray-800 dark:text-white/90 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
            >
              Manage categories
            </Link>
            {isAdmin ? (
              <Link
                href="/users"
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50/60 dark:border-gray-800 dark:text-white/90 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
              >
                User admin
              </Link>
            ) : (
              <div className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Read-only access
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div>
            <DatePicker
              id="dashboard-from-date"
              label="From date"
              placeholder="mm/dd/yyyy"
              defaultDate={fromDate || undefined}
              value={fromDate || undefined}
              onValueChange={handleFromDateChange}
            />
          </div>
          <div>
            <DatePicker
              id="dashboard-to-date"
              label="To date"
              placeholder="mm/dd/yyyy"
              defaultDate={toDate || undefined}
              value={toDate || undefined}
              onValueChange={handleToDateChange}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent items
            </label>
            <select
              value={recentLimit}
              onChange={(e) => handleRecentLimitChange(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Trend view
            </label>
            <div className="grid grid-cols-2 rounded-lg border border-gray-300 p-1 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleTrendByChange("monthly")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  trendBy === "monthly"
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => handleTrendByChange("weekly")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  trendBy === "weekly"
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setFromDate("");
              setToDate("");
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Clear date filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{toCurrency(summary.total_income)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expense</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">{toCurrency(summary.total_expense)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Balance</p>
          <p className={`mt-2 text-2xl font-semibold ${summary.net_balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
            {toCurrency(summary.net_balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Cashflow Mix
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Income versus expense distribution for the selected window.
              </p>
            </div>
          </div>
          <div className="mt-4">
            {cashflowSeries.length === 2 && cashflowSeries.some((value) => value > 0) ? (
              <Chart
                key={`cashflow-${cashflowSeries.join("-")}`}
                options={cashflowOptions}
                series={cashflowSeries}
                type="donut"
                height={300}
                width="100%"
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Not enough activity to draw the cashflow mix chart.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Category Mix
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Top categories by total value. Useful for spotting concentration.
              </p>
            </div>
          </div>
          <div className="mt-4">
            {categoryPieSeries.length > 0 ? (
              <Chart
                key={`category-${categoryPieSeries.join("-")}`}
                options={categoryPieOptions}
                series={categoryPieSeries}
                type="pie"
                height={300}
                width="100%"
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No category data available for the selected period.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {trendBy === "monthly" ? "Monthly Bar Trend" : "Weekly Bar Trend"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Income, expense, and net totals shown as bars from your backend summary endpoint.
              </p>
            </div>
          </div>
        <div className="mt-4">
          <Chart
            key={`trend-${trendBy}-${summary.trend.map((point) => point.period).join("-")}`}
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={340}
            width="100%"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Savings rate</p>
          <p className="mt-2 text-2xl font-semibold text-blue-600">
            {savingsRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Net balance as a share of total income.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Expense ratio</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {expenseRatio.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Expense compared with total income.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Top category</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {topCategory?.category_name || "N/A"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {topCategory ? toCurrency(topCategory.total) : "No category totals yet"}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average recent txn</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {toCurrency(averageRecentTxn)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Recent activity only, useful for spotting spikes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Trend Insights
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.04]">
              <p className="text-gray-500 dark:text-gray-400">Best period</p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                {bestPeriod ? `${bestPeriod.period} (${toCurrency(bestPeriod.net)})` : "N/A"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.04]">
              <p className="text-gray-500 dark:text-gray-400">Weakest period</p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                {worstPeriod ? `${worstPeriod.period} (${toCurrency(worstPeriod.net)})` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Category Leaders
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.04]">
              <p className="text-gray-500 dark:text-gray-400">Top income category</p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                {topIncomeCategory
                  ? `${topIncomeCategory.category_name} (${toCurrency(topIncomeCategory.total)})`
                  : "No income category data"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.04]">
              <p className="text-gray-500 dark:text-gray-400">Top expense category</p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                {topExpenseCategory
                  ? `${topExpenseCategory.category_name} (${toCurrency(topExpenseCategory.total)})`
                  : "No expense category data"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Volume Snapshot
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.04]">
              <p className="text-gray-500 dark:text-gray-400">Average category size</p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                {toCurrency(averageCategorySize)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.04]">
              <p className="text-gray-500 dark:text-gray-400">Tracked categories</p>
              <p className="mt-1 font-semibold text-gray-800 dark:text-white/90">
                {summary.category_totals.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Category Totals</h3>
          <div className="mt-4 space-y-2">
            {summary.category_totals.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No category totals found.</p>
            ) : (
              summary.category_totals.map((item) => (
                <div key={item.category_id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white/90">{item.category_name}</p>
                    <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{item.type}</p>
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">{toCurrency(item.total)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Activity</h3>
          <div className="mt-4 space-y-2">
            {summary.recent_activity.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent transactions yet.</p>
            ) : (
              summary.recent_activity.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white/90">{txn.note || "Transaction"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{toDisplayDate(txn.date)}</p>
                  </div>
                  <p className={`font-semibold ${txn.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {txn.type === "income" ? "+" : "-"}
                    {toCurrency(txn.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
