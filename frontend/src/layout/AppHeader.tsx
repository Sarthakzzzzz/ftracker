"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { clearAccessToken, useCurrentRole, useIsAuthenticated } from "@/lib/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions" },
  { label: "Categories", href: "/categories" },
  { label: "Users", href: "/users" },
] as const;

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useCurrentRole() ?? "viewer";
  const isAuthenticated = useIsAuthenticated();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      clearAccessToken();
    }
    router.replace("/signin");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-3 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-theme-xs">
              FT
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                Finance
              </p>
              <p className="text-base font-semibold text-gray-800 dark:text-white/90">
                Dashboard
              </p>
            </div>
          </Link>

          <nav className="flex flex-1 items-center gap-2 overflow-x-auto lg:justify-center">
            {navItems.map((item) => {
              const active = item.href === pathname;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand-500 text-white shadow-theme-xs"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold capitalize text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              Role: {role}
            </span>
            <ThemeToggleButton />
            <UserDropdown />
            <button
              type="button"
              onClick={handleAuthAction}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04]"
            >
              {isAuthenticated ? "Sign out" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
