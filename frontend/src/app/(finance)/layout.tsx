"use client";

import { canAccessPath } from "@/lib/rbac";
import { getCurrentRole, isAuthenticated } from "@/lib/auth";
import AppHeader from "@/layout/AppHeader";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/finance";
import React, { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [guestDashboard, setGuestDashboard] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      if (pathname === "/dashboard") {
        setGuestDashboard(true);
        setReady(true);
        return;
      }

      router.replace("/signin?next=/dashboard");
      return;
    }

    setGuestDashboard(false);
    queueMicrotask(() => {
      setRole(getCurrentRole());
      setReady(true);
    });
  }, [pathname, router]);

  const hasAccess = guestDashboard || (ready && canAccessPath(role, pathname));

  if (!ready && !guestDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
        Checking session...
      </div>
    );
  }

  if (guestDashboard) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-theme-xs">
                FT
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                  Finance Tracker
                </p>
                <p className="text-sm text-white/70">
                  Public dashboard preview
                </p>
              </div>
            </Link>

            <Link
              href="/signin?next=/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Sign in
            </Link>
          </div>

          <main className="flex flex-1 items-center py-14 lg:py-20">
            <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="max-w-3xl">
                <span className="inline-flex rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
                  Dashboard preview
                </span>
                <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  Open the finance dashboard.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                  Sign in to view live totals, charts, recent activity, and role-aware
                  controls. This preview shows the structure before authentication.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/signin?next=/dashboard"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
                  >
                    Sign in to continue
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Back to home
                  </Link>
                </div>
              </section>

              <section className="grid gap-4">
                {[
                  ["Total income", "$1,000.00"],
                  ["Net balance", "$1,000.00"],
                  ["Recent items", "Transactions and trends"],
                  ["Role access", "Admin, analyst, viewer"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-theme-lg dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            Access restricted
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white/90">
            You cannot open this page
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Your current role does not allow access here. Try the dashboard or
            a page assigned to your role.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <main className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</main>
    </div>
  );
}
