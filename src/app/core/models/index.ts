// Shapes returned by the FastAPI backend (see backend/app/schemas in the API repository).

export type Role = 'manager' | 'waiter';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: Role;
}

export interface UserCreate {
  username: string;
  full_name: string;
  password: string;
  role: Role;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type TableState = 'free' | 'occupied';

export interface TableStatus {
  id: number;
  name: string;
  status: TableState;
  waiter_id: number | null;
  waiter_name: string | null;
  order_count: number;
  total: number;
}

export interface ProductPresentation {
  id: number;
  name: string;
  price: number;
}

export interface MenuProduct {
  id: number;
  name: string;
  category_id: number;
  presentations: ProductPresentation[];
}

export interface MenuCategory {
  id: number;
  name: string;
  products: MenuProduct[];
}

export interface Order {
  id: number;
  table_id: number;
  product_id: number;
  presentation_id: number;
  quantity: number;
  unit_price: number;
  notes: string | null;
}

export interface OrderCreate {
  product_id: number;
  presentation_id: number;
  quantity: number;
  notes?: string | null;
}

export type OrderUpdate = Partial<Pick<Order, 'presentation_id' | 'quantity' | 'notes'>>;

export interface BillLine {
  product_id: number;
  product_name: string;
  presentation_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes: string | null;
}

export interface Bill {
  id: number;
  table_id: number;
  table_name: string;
  waiter_id: number;
  waiter_name: string;
  paid_by: string;
  paid_at: string;
  lines: BillLine[];
  total: number;
}

export interface WaiterSales {
  waiter_id: number;
  waiter_name: string;
  bills: number;
  total: number;
}

export interface ProductSales {
  product_id: number;
  product_name: string;
  quantity: number;
  total: number;
}

export interface DailyReport {
  day: string;
  bills: number;
  total: number;
  average_ticket: number;
  by_waiter: WaiterSales[];
  top_products: ProductSales[];
}
