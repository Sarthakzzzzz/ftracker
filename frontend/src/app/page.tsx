import Link from "next/link";
import type { Metadata } from "next";

const highlights = [
  {
    title: "Role-based access",
    body: "Admin, analyst, and viewer flows are enforced in the backend and reflected in the UI.",
  },
  {
    title: "Financial CRUD",
    body: "Create, update, delete, and filter transactions and categories with validation.",
  },
  {
    title: "Analytics dashboard",
    body: "Totals, category splits, recent activity, and trend charts are built for reporting.",
  },
  {
    title: "Deployment ready",
    body: "Docker Compose, Alembic migrations, and production-friendly env defaults are included.",
  },
];

const roleCards = [
  {
    role: "admin",
    title: "Operations control",
    body: "Manages users, records, categories, and system-wide configuration.",
  },
  {
    role: "analyst",
    title: "Insight access",
    body: "Reviews records and dashboard summaries without write privileges.",
  },
  {
    role: "viewer",
    title: "Read-only visibility",
    body: "Views dashboard data and history while staying safely locked to read access.",
  },
];

const stack = [
  "FastAPI",
  "SQLModel",
  "PostgreSQL",
  "Alembic",
  "Next.js",
  "Tailwind CSS",
  "ApexCharts",
  "Docker Compose",
];

export const metadata: Metadata = {
  title: "Finance Tracker | Role-Based Finance Dashboard",
  description:
    "A finance dashboard portfolio page for the FTracker backend with access control, CRUD, and analytics.",
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-gray-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(70,95,255,0.28),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(251,101,20,0.22),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_45%,_#030712_100%)]" />
      <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute right-[-6rem] top-44 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-sm font-bold text-white shadow-theme-xs">
              FT
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                Finance Tracker
              </p>
              <p className="text-sm text-white/70">
                Finance data processing and access control
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Open dashboard
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Sign in
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
              Finance dashboard portfolio
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Finance Data Processing and Access Control Backend
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              This project combines secure user roles, transaction management,
              dashboard summaries, and deployment-friendly infrastructure into
              one streamlined finance system.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
              >
                View dashboard
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Demo login
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["3 roles", "Admin, analyst, viewer"],
                ["CRUD APIs", "Users, categories, transactions"],
                ["Analytics", "Totals, trends, category mix"],
                ["Deploy ready", "Docker + Alembic included"],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-lg font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/65">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
                System snapshot
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["Auth", "Token-based login"],
                  ["Data", "PostgreSQL + SQLModel"],
                  ["Reporting", "Dashboard summary API"],
                  ["Access", "RBAC enforced server-side"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-gray-950/50 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {label}
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
                Tech stack
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-200">
                {item.title}
              </p>
              <p className="mt-4 text-sm leading-7 text-white/70">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 py-8 lg:grid-cols-3">
          {roleCards.map((item) => (
            <article
              key={item.role}
              className="rounded-3xl border border-white/10 bg-gray-950/70 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                {item.role}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-brand-500/10 p-8 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
                Want the app view?
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Open the dashboard or sign in as a demo role.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
              >
                Dashboard
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Demo sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
