import {
  CategoriesPublic,
  CategoryCreatePayload,
  CategoryPublic,
  CategoryUpdatePayload,
  DashboardSummary,
  MessageResponse,
  TokenResponse,
  TransactionCreatePayload,
  TransactionPublic,
  TransactionsPublic,
  TransactionUpdatePayload,
  UserCreatePayload,
  UserPublic,
  UsersPublic,
  UserUpdatePayload,
} from "@/types/finance";
import { clearAccessToken, getAccessToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = true,
): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");

  // Respect explicit content types like form-encoded login requests.
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const errorData = await response.json();
      detail =
        typeof errorData?.detail === "string"
          ? errorData.detail
          : JSON.stringify(errorData);
    } catch {
      detail = await response.text();
    }

    if (response.status === 401 || response.status === 403) {
      clearAccessToken();
    }

    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  return request<TokenResponse>(
    "/login/access-token",
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
    false,
  );
}

export async function me(): Promise<UserPublic> {
  return request<UserPublic>("/users/me");
}

export async function getDashboardSummary(params?: {
  from_date?: string;
  to_date?: string;
  recent_limit?: number;
  trend_by?: "monthly" | "weekly";
}): Promise<DashboardSummary> {
  const qs = new URLSearchParams();
  if (params?.from_date) qs.set("from_date", params.from_date);
  if (params?.to_date) qs.set("to_date", params.to_date);
  if (params?.recent_limit) qs.set("recent_limit", String(params.recent_limit));
  if (params?.trend_by) qs.set("trend_by", params.trend_by);
  const query = qs.toString();
  return request<DashboardSummary>(`/dashboard/summary${query ? `?${query}` : ""}`);
}

export async function getTransactions(params?: {
  skip?: number;
  limit?: number;
  type?: "income" | "expense";
  category_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<TransactionsPublic> {
  const qs = new URLSearchParams();
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.type) qs.set("type", params.type);
  if (params?.category_id) qs.set("category_id", params.category_id);
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);

  const query = qs.toString();
  return request<TransactionsPublic>(`/transactions/${query ? `?${query}` : ""}`);
}

export async function createTransaction(payload: TransactionCreatePayload): Promise<TransactionPublic> {
  return request<TransactionPublic>("/transactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTransaction(
  transactionId: string,
  payload: TransactionUpdatePayload,
): Promise<TransactionPublic> {
  return request<TransactionPublic>(`/transactions/${transactionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTransaction(transactionId: string): Promise<MessageResponse> {
  return request<MessageResponse>(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}

export async function getCategories(params?: {
  skip?: number;
  limit?: number;
}): Promise<CategoriesPublic> {
  const qs = new URLSearchParams();
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  const query = qs.toString();

  return request<CategoriesPublic>(`/categories/${query ? `?${query}` : ""}`);
}

export async function createCategory(payload: CategoryCreatePayload): Promise<CategoryPublic> {
  return request<CategoryPublic>("/categories/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  categoryId: string,
  payload: CategoryUpdatePayload,
): Promise<CategoryPublic> {
  return request<CategoryPublic>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(categoryId: string): Promise<MessageResponse> {
  return request<MessageResponse>(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export async function getUsers(params?: {
  skip?: number;
  limit?: number;
}): Promise<UsersPublic> {
  const qs = new URLSearchParams();
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  const query = qs.toString();

  return request<UsersPublic>(`/users/${query ? `?${query}` : ""}`);
}

export async function createUser(payload: UserCreatePayload): Promise<UserPublic> {
  return request<UserPublic>("/users/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(userId: string, payload: UserUpdatePayload): Promise<UserPublic> {
  return request<UserPublic>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string): Promise<MessageResponse> {
  return request<MessageResponse>(`/users/${userId}`, {
    method: "DELETE",
  });
}

export { ApiError, API_BASE };
