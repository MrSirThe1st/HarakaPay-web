// Payment Fee System Types
// Types for managing platform payment fees with dual approval workflow

export type PaymentFeeRateStatus =
  | 'pending_school'      // Waiting for school approval
  | 'pending_admin'       // Waiting for admin approval
  | 'active'              // Both approved, in effect
  | 'rejected_by_school'  // School rejected
  | 'rejected_by_admin'   // Admin rejected
  | 'expired';            // Approval expired

export type ProposerRole = 'platform_admin' | 'school_admin';

export type FeeChangeType =
  | 'created'
  | 'approved_school'
  | 'approved_admin'
  | 'rejected'
  | 'activated'
  | 'expired'
  | 'updated';

export interface PaymentFeeRate {
  id: string;
  school_id: string;
  fee_percentage: number;
  status: PaymentFeeRateStatus;

  // Proposal info
  proposed_by_id: string;
  proposed_by_role: ProposerRole;
  notes?: string;

  // Approvals
  school_approved_at?: string;
  school_approved_by?: string;
  admin_approved_at?: string;
  admin_approved_by?: string;

  // Rejection
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;

  // Lifecycle
  effective_from: string;
  effective_until?: string;
  expires_at?: string;
  activated_at?: string;

  created_at: string;
  updated_at: string;
}

export interface PaymentFeeRateHistory {
  id: string;
  rate_id: string;
  school_id: string;
  fee_percentage: number;
  status: PaymentFeeRateStatus;
  changed_by?: string;
  change_type: FeeChangeType;
  change_details: Record<string, unknown>;
  created_at: string;
}

export interface TransactionFeeSnapshot {
  id: string;
  payment_id: string;
  student_id: string;
  school_id: string;

  // Fee data at transaction time
  fee_rate_id?: string;
  fee_percentage: number;
  base_amount: number;
  fee_amount: number;
  total_amount: number;

  // Metadata
  payment_method: string;
  payment_status: string;
  locked_at: string;
  created_at: string;
}

// Calculation result interface
export interface FeeCalculation {
  baseAmount: number;              // Original fee amount
  feePercentage: number;          // e.g., 2.5
  feeAmount: number;              // Calculated platform fee
  totalAmount: number;            // What parent pays (baseAmount + feeAmount)
}

// API request/response types
export interface CreateFeeRateRequest {
  school_id: string;
  fee_percentage: number;
  proposed_by_role: ProposerRole;
  effective_from?: string;
}

export interface ApproveFeeRateRequest {
  rate_id: string;
  approver_role: 'admin' | 'school';
}

export interface RejectFeeRateRequest {
  rate_id: string;
  rejection_reason: string;
  rejector_role: 'admin' | 'school';
}

// Dashboard/Reporting types
export interface SchoolFeeOwed {
  school_id: string;
  school_name: string;
  total_fees_owed: number;
  transaction_count: number;
  last_transaction_date?: string;
  current_fee_percentage: number;
}

export interface FeeReportSummary {
  total_fees_owed: number;
  total_transactions: number;
  schools_count: number;
  date_range: {
    start: string;
    end: string;
  };
  schools: SchoolFeeOwed[];
}

// Extended PaymentFeeRate with relations
export interface PaymentFeeRateWithDetails extends PaymentFeeRate {
  school?: {
    id: string;
    name: string;
  };
  proposed_by?: {
    id: string;
    first_name?: string;
    last_name?: string;
    role: string;
  };
  school_approved_by_profile?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
  admin_approved_by_profile?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

// Status display helpers
export const FEE_STATUS_LABELS: Record<PaymentFeeRateStatus, string> = {
  pending_school: 'Pending School Approval',
  pending_admin: 'Pending Admin Approval',
  active: 'Active',
  rejected_by_school: 'Rejected by School',
  rejected_by_admin: 'Rejected by Admin',
  expired: 'Expired'
};

export const FEE_STATUS_COLORS: Record<PaymentFeeRateStatus, string> = {
  pending_school: 'yellow',
  pending_admin: 'yellow',
  active: 'green',
  rejected_by_school: 'red',
  rejected_by_admin: 'red',
  expired: 'gray'
};

// Helper function to check if rate is pending approval
export function isPendingApproval(status: PaymentFeeRateStatus): boolean {
  return status === 'pending_school' || status === 'pending_admin';
}

// Helper function to check if rate is rejected
export function isRejected(status: PaymentFeeRateStatus): boolean {
  return status === 'rejected_by_school' || status === 'rejected_by_admin';
}

// Helper function to calculate fee from base amount
export function calculateFee(baseAmount: number, feePercentage: number): FeeCalculation {
  const feeAmount = Number((baseAmount * (feePercentage / 100)).toFixed(2));
  const totalAmount = baseAmount + feeAmount;

  return {
    baseAmount,
    feePercentage,
    feeAmount,
    totalAmount
  };
}
