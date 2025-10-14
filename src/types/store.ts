// src/types/store.ts

export interface StoreCategory {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreItem {
  id: string;
  schoolId: string;
  categoryId: string;
  name: string;
  description: string | null;
  itemType: 'sale' | 'hire';
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  // Relations
  category?: StoreCategory;
  hireSettings?: HireSettings;
}

export interface HireSettings {
  id: string;
  itemId: string;
  durationType: 'daily' | 'weekly' | 'monthly' | 'per_term' | 'per_year' | 'custom';
  minDurationDays: number;
  maxDurationDays: number;
  depositAmount: number | null;
  lateFeePerDay: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  orderType: 'purchase' | 'hire';
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string | null;
  paymentReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  parent?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
  orderItems?: StoreOrderItem[];
}

export interface StoreOrderItem {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  // Relations
  item?: StoreItem;
  hireRecord?: HireRecord;
}

export interface HireRecord {
  id: string;
  orderItemId: string;
  hireStartDate: string;
  hireEndDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  depositPaid: number;
  depositReturned: boolean;
  lateFees: number;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockRequest {
  id: string;
  itemId: string;
  parentId: string;
  studentId: string;
  requestedQuantity: number;
  message: string | null;
  status: 'pending' | 'acknowledged' | 'fulfilled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // Relations
  item?: StoreItem;
  parent?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
}

// API Response Types
export interface StoreApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StorePaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface StoreStatsData {
  total: number;
  active?: number;
  inactive?: number;
  lowStock?: number;
  pendingOrders?: number;
  activeHires?: number;
  overdueHires?: number;
  pendingRequests?: number;
}

// Form Types
export interface StoreCategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export interface StoreItemFormData {
  name: string;
  description: string;
  categoryId: string;
  itemType: 'sale' | 'hire';
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  images: string[];
  hireSettings?: {
    durationType: 'daily' | 'weekly' | 'monthly' | 'per_term' | 'per_year' | 'custom';
    minDurationDays: number;
    maxDurationDays: number;
    depositAmount: number | null;
    lateFeePerDay: number | null;
  };
}

export interface CreateOrderData {
  studentId: string;
  orderType: 'purchase' | 'hire';
  items: Array<{
    itemId: string;
    quantity: number;
    hireStartDate?: string;
    hireEndDate?: string;
  }>;
  notes?: string;
}

export interface StockRequestFormData {
  itemId: string;
  studentId: string;
  requestedQuantity: number;
  message?: string;
}

// Filter Types
export interface StoreItemFilters {
  categoryId?: string;
  itemType?: 'sale' | 'hire';
  isAvailable?: boolean;
  lowStock?: boolean;
  search?: string;
}

export interface StoreOrderFilters {
  status?: string;
  paymentStatus?: string;
  orderType?: 'purchase' | 'hire';
  dateFrom?: string;
  dateTo?: string;
  parentId?: string;
  studentId?: string;
}

export interface StockRequestFilters {
  status?: string;
  itemId?: string;
  parentId?: string;
  studentId?: string;
}

// Cart Types (for mobile)
export interface CartItem {
  item: StoreItem;
  quantity: number;
  hireStartDate?: string;
  hireEndDate?: string;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}
