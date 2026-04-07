import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white p-6 z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 lg:flex-row sm:p-0">
          {children}
          <div className="hidden h-full w-full items-center bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
            <div className="relative z-1 flex items-center justify-center">
              <GridShape />
              <div className="flex max-w-xs flex-col items-center">
                <Link
                  href="/"
                  className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-white"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs font-bold text-brand-700">
                    FT
                  </span>
                  <span className="font-semibold">Finance Tracker</span>
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Personal finance dashboard powered by FastAPI.
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
