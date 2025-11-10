// src/app/(dashboard)/school/fees/types/feeTypes.ts

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  terms: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    type: 'term' | 'semester' | 'quarter' | 'custom';
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  isRecurring: boolean;
  supportsOneTime: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GradeTemplate {
  id: string;
  name: string;
  description: string;
  gradeLevel: string;
  categories: {
    categoryId: string;
    amount: number;
  }[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  gradeLevel: string;
  academicYearId: string;
  categories: {
    categoryId: string;
    categoryName: string;
    amount: number;
  }[];
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSchedule {
  id: string;
  name: string;
  description: string;
  feeStructureId: string;
  installments: {
    id: string;
    name: string;
    dueDate: string;
    amount: number;
    percentage: number;
  }[];
  totalAmount: number;
  discountPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedFeeSchedule {
  id: string;
  name: string;
  academicYearId: string;
  feeStructureId: string;
  paymentScheduleId: string;
  publishedAt: string;
  publishedBy: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface SchoolPaymentSettings {
  id: string;
  schoolId: string;
  defaultCurrency: string;
  defaultLanguage: string;
  paymentReminderDays: number;
  lateFeePercentage: number;
  receiptPrefix: string;
  receiptNumberFormat: string;
  includeSchoolLogo: boolean;
  includeSchoolAddress: boolean;
  includeTaxId: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditTrail {
  id: string;
  action: string;
  entityType: 'academic-year' | 'fee-category' | 'fee-structure' | 'payment-schedule' | 'published-schedule';
  entityId: string;
  oldValues: any;
  newValues: any;
  performedBy: string;
  performedAt: string;
}

export interface WizardData {
  academicContext: {
    academicYear: string; // e.g., "2024-2025"
    gradeLevel: string | string[]; // Single or multiple grades
    structureName: string;
    appliesTo: 'school' | 'grade';
    currency: string; // From school settings
  };
  feeItems: {
    categoryId: string;
    categoryName: string;
    amount: number;
    isMandatory: boolean;
    paymentModes: Array<'installment' | 'one_time' | 'termly' | 'monthly'>;
    paymentPlans: {
      type: 'monthly' | 'termly' | 'one_time' | 'installment';
      discountPercentage: number;
      installments: {
        label: string;
        amount: number;
        dueDate: string;
      }[];
    }[];
  }[];
  // Deprecated: keeping for backward compatibility during migration
  paymentPlans?: {
    type: 'monthly' | 'termly' | 'one_time' | 'installment';
    discountPercentage: number;
    installments: {
      label: string;
      amount: number;
      dueDate: string;
    }[];
  }[];
}

export type ActiveTab = 'publish' | 'audit';
export type ViewMode = 'wizard' | 'management';
export type WizardStep = 1 | 2 | 3 | 4;
