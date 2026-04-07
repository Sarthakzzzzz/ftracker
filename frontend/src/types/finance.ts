export type UserRole = "admin" | "analyst" | "viewer";
export type UserStatus = "active" | "inactive";

export type TransactionType = "income" | "expense";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string | null;
}

export interface UsersPublic {
  data: UserPublic[];
  count: number;
}

export interface CategoryPublic {
  id: string;
  name: string;
  type: TransactionType;
}

export interface CategoriesPublic {
  data: CategoryPublic[];
  count: number;
}

export interface TransactionPublic {
  id: string;
  owner_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  note?: string | null;
  date: string;
  created_at?: string | null;
}

export interface TransactionsPublic {
  data: TransactionPublic[];
  count: number;
}

export interface CategoryTotal {
  category_id: string;
  category_name: string;
  type: TransactionType;
  total: number;
}

export interface TrendPoint {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface DashboardSummary {
  from_date: string | null;
  to_date: string | null;
  total_income: number;
  total_expense: number;
  net_balance: number;
  category_totals: CategoryTotal[];
  recent_activity: TransactionPublic[];
  trend: TrendPoint[];
}

export interface MessageResponse {
  message: string;
}

export interface TransactionCreatePayload {
  amount: number;
  type: TransactionType;
  category_id: string;
  note?: string;
  date: string;
}

export interface TransactionUpdatePayload {
  amount?: number;
  type?: TransactionType;
  category_id?: string;
  note?: string;
  date?: string;
}

export interface CategoryCreatePayload {
  name: string;
  type: TransactionType;
}

export interface CategoryUpdatePayload {
  name?: string;
  type?: TransactionType;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  full_name?: string;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
  is_superuser: boolean;
}

export interface UserUpdatePayload {
  email?: string;
  password?: string;
  full_name?: string;
  role?: UserRole;
  status?: UserStatus;
  is_active?: boolean;
  is_superuser?: boolean;
}
