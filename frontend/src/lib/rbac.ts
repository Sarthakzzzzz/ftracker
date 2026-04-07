import { UserRole } from "@/types/finance";

type RouteAccessRule = {
  path: string;
  roles: UserRole[];
};

export const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { path: "/dashboard", roles: ["admin", "analyst", "viewer"] },
  { path: "/transactions", roles: ["admin", "analyst", "viewer"] },
  { path: "/categories", roles: ["admin", "analyst", "viewer"] },
  { path: "/users", roles: ["admin"] },
];

function normalizePath(pathname: string): string {
  return pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

export function getAllowedRolesForPath(pathname: string): UserRole[] {
  const normalizedPath = normalizePath(pathname);
  const rule = ROUTE_ACCESS_RULES.find(({ path }) => path === normalizedPath);
  return rule?.roles ?? ["admin", "analyst", "viewer"];
}

export function canAccessPath(
  role: UserRole | null,
  pathname: string,
): boolean {
  if (!role) return false;
  return getAllowedRolesForPath(pathname).includes(role);
}

export function canViewUsers(role: UserRole | null): boolean {
  return role === "admin";
}
