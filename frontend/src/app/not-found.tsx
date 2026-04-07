import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Error
        </p>
        <h1 className="mb-4 text-7xl font-extrabold leading-none text-gray-900 dark:text-white">
          404
        </h1>
        <p className="mb-8 text-xl font-semibold text-gray-800 dark:text-white/90">
          Page not found
        </p>

        <p className="mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          We can’t seem to find the page you are looking for!
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Back to Home Page
        </Link>
      </div>
      {/* <!-- Footer --> */}
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - Finance Tracker
      </p>
    </div>
  );
}
