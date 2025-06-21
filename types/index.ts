// User Types
export interface User {
  id: string;
  username: string;
  password: string; // hashed
  role: 'admin' | 'exchange';
  exchangeName?: string;
  contactInfo?: ContactInfo;
  balance: number;
  commissionRates: CommissionRates;
  assignedBanks: string[]; // array of bank IDs
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface CommissionRates {
  incoming: CommissionRate;
  outgoing: CommissionRate;
}

export interface CommissionRate {
  type: 'fixed' | 'percentage';
  value: number;
}

// Order Types
export interface Order {
  id: string;
  orderId: string; // Custom format: TYYMMXXXX
  exchangeId: string; // reference to user
  type: 'incoming' | 'outgoing';
  status: OrderStatus;
  submittedAmount: number;
  finalAmount?: number; // for incoming transfers
  commission: number;
  cliqDetails?: CliqDetails;
  recipientDetails?: RecipientDetails;
  bankUsed?: string;
  platformBankUsed?: string; // for outgoing transfers
  screenshots: string[]; // array of file URLs
  adminNotes?: string;
  rejectionReason?: string;
  senderName?: string; // optional for incoming transfers
  timestamps: OrderTimestamps;
}

export type OrderStatus = 
  | 'submitted'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface CliqDetails {
  aliasName?: string;
  mobileNumber?: string; // Jordanian mobile number
}

export interface RecipientDetails {
  name?: string;
  bank?: string;
  accountNumber?: string;
  notes?: string;
}

export interface OrderTimestamps {
  created: Date;
  updated: Date;
  completed?: Date;
  approved?: Date;
  rejected?: Date;
}

// Bank Types
export interface PlatformBank {
  id: string;
  name: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  isActive: boolean;
  type: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAssignment {
  id: string;
  exchangeId: string;
  bankId: string;
  assignmentType: 'public' | 'private';
  isActive: boolean;
  createdAt: Date;
}

// Message/Chat Types
export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: 'admin' | 'exchange';
  message: string;
  messageType: 'text' | 'system';
  timestamp: Date;
  isRead: boolean;
}

export interface ChatThread {
  orderId: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  participants: string[]; // user IDs
}

// File Upload Types
export interface FileUpload {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  orderId?: string;
  createdAt: Date;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface CreateOrderForm {
  type: 'incoming' | 'outgoing';
  amount: number;
  cliqDetails?: CliqDetails;
  recipientDetails?: RecipientDetails;
  bankUsed?: string;
  senderName?: string;
  screenshots?: File[];
}

export interface UpdateOrderForm {
  finalAmount?: number;
  adminNotes?: string;
  rejectionReason?: string;
  status?: OrderStatus;
}

// Filter and Search Types
export interface OrderFilters {
  status?: OrderStatus[];
  type?: ('incoming' | 'outgoing')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  exchangeId?: string;
  searchTerm?: string;
}

export interface UserFilters {
  role?: ('admin' | 'exchange')[];
  status?: ('active' | 'inactive')[];
  searchTerm?: string;
}

// Statistics Types
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  totalAmount: number;
  totalCommission: number;
  averageProcessingTime: number; // in hours
}

export interface ExchangeStatistics extends OrderStatistics {
  currentBalance: number;
  monthlyVolume: number;
  successRate: number; // percentage
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'order_status' | 'new_message' | 'balance_update' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
} 