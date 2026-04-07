"use client";

import { me } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import { UserPublic } from "@/types/finance";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

function getInitials(user: UserPublic | null): string {
  const source = user?.full_name?.trim() || user?.email || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserPublic | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    me()
      .then((data) => {
        if (mounted) setUser(data);
      })
      .catch(() => {
        if (mounted) setUser(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function onSignOut() {
    clearAccessToken();
    setIsOpen(false);
    router.replace("/signin");
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="mr-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
          {getInitials(user)}
        </span>

        <span className="mr-1 block font-medium text-theme-sm">
          {user?.full_name || user?.email || "User"}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user?.full_name || "Finance User"}
          </span>
          <span className="mt-0.5 block text-gray-500 text-theme-xs dark:text-gray-400">
            {user?.email || "unknown"}
          </span>
          <span className="mt-1 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium capitalize text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {user?.role || "viewer"}
          </span>
        </div>

        <button
          onClick={onSignOut}
          className="group mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-left font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
