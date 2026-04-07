import { useSyncExternalStore } from "react";

import { UserRole } from "@/types/finance";

const TOKEN_KEY = "finance_token";
const AUTH_EVENT = "finance-auth-changed";

interface TokenPayload {
  sub?: string;
  role?: UserRole;
  exp?: number;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return atob(padded);
}

function notifyAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
}

export function parseToken(token: string | null): TokenPayload | null {
  if (!token) return null;
  // Backend issues tokens as `payload.signature`, not JWT `header.payload.signature`.
  const [payloadPart] = token.split(".");
  if (!payloadPart) return null;

  try {
    return JSON.parse(decodeBase64Url(payloadPart)) as TokenPayload;
  } catch {
    return null;
  }
}

export function getCurrentRole(): UserRole | null {
  const payload = parseToken(getAccessToken());
  return payload?.role ?? null;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleAuthChange = () => onStoreChange();
  window.addEventListener("storage", handleAuthChange);
  window.addEventListener(AUTH_EVENT, handleAuthChange);

  return () => {
    window.removeEventListener("storage", handleAuthChange);
    window.removeEventListener(AUTH_EVENT, handleAuthChange);
  };
}

export function useAccessToken(): string | null {
  return useSyncExternalStore(subscribe, getAccessToken, () => null);
}

export function useCurrentRole(): UserRole | null {
  const token = useAccessToken();
  return parseToken(token)?.role ?? null;
}

export function useIsAuthenticated(): boolean {
  const token = useAccessToken();
  return token ? !isTokenExpired(token) : false;
}

export function isTokenExpired(token: string | null): boolean {
  const payload = parseToken(token);
  if (!payload?.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowSeconds;
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}
