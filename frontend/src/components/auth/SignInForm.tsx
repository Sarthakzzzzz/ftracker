"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { ApiError, login } from "@/lib/api";
import { isAuthenticated, setAccessToken } from "@/lib/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const demoAccounts = [
  {
    role: "admin",
    email: "admin@example.com",
    password: "adminadmin",
    description: "Full access",
  },
  {
    role: "analyst",
    email: "analyst@example.com",
    password: "analyst123",
    description: "Read-only finance insights",
  },
  {
    role: "viewer",
    email: "viewer@example.com",
    password: "viewer123",
    description: "View dashboards and reports",
  },
] as const;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("adminadmin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(nextPath);
    }
  }, [router, nextPath]);

  const handleDemoSelect = (account: (typeof demoAccounts)[number]) => {
    setError(null);
    setShowPassword(false);
    setEmail(account.email);
    setPassword(account.password);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(email.trim(), password);
      setAccessToken(response.access_token);
      router.replace(nextPath);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Back to home page
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use your finance dashboard credentials.
          </p>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            Quick login
          </p>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Pick a role to fill in the demo credentials, then press Sign in.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => handleDemoSelect(account)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-left shadow-theme-xs transition hover:border-brand-300 hover:bg-brand-50/60 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
              >
                <span className="block text-sm font-semibold capitalize text-gray-800 dark:text-white/90">
                  Use {account.role} account
                </span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  {account.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="admin@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300">
              {error}
            </div>
          ) : null}

          <Button className="w-full" size="sm" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
