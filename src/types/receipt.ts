// src/types/receipt.ts

export interface ReceiptTemplate {
  id: string;
  school_id: string;
  template_name: string;
  template_type: string;
  show_logo: boolean;
  logo_position: 'upper-left' | 'upper-center' | 'upper-right';
  visible_fields: ReceiptFieldConfig;
  style_config: ReceiptStyleConfig;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ReceiptFieldConfig {
  // Header fields
  school_name: boolean;
  school_address: boolean;
  school_contact: boolean;
  school_registration: boolean;
  
  // Student info fields
  student_name: boolean;
  student_id: boolean;
  grade_level: boolean;
  class_section: boolean;
  
  // Payment info fields
  receipt_number: boolean;
  payment_date: boolean;
  payment_method: boolean;
  transaction_id: boolean;
  amount: boolean;
  fee_category: boolean;
  academic_year: boolean;
  term: boolean;
  
  // Footer fields
  custom_footer: boolean;
  watermark: boolean;
  signature: boolean;
}

export interface ReceiptStyleConfig {
  primary_color: string;
  header_background: string;
  font_family: 'Inter' | 'Arial' | 'Times New Roman' | 'Helvetica' | 'Georgia';
  font_size: 'small' | 'medium' | 'large';
  border_style: 'none' | 'solid' | 'dashed';
  spacing: 'compact' | 'normal' | 'relaxed';
  text_alignment: 'left' | 'center' | 'right';
  currency_symbol: string;
  decimal_places: number;
  logo_url?: string;
}

export interface ReceiptPreviewData {
  school: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo_url: string | null;
    registration_number: string;
  };
  student: {
    name: string;
    id: string;
    grade: string;
    section: string;
  };
  payment: {
    receipt_number: string;
    date: string;
    method: string;
    transaction_id: string;
    amount: number;
    category: string;
    academic_year: string;
    term: string;
  };
}

export interface FeeCategory {
  id: string;
  name: string;
  description: string;
  is_mandatory: boolean;
  is_recurring: boolean;
  category_type: 'tuition' | 'additional';
}

export interface ReceiptTemplateForm {
  template_name: string;
  template_type: string;
  show_logo: boolean;
  logo_position: 'upper-left' | 'upper-center' | 'upper-right';
  visible_fields: ReceiptFieldConfig;
  style_config: ReceiptStyleConfig;
}

export const DEFAULT_FIELD_CONFIG: ReceiptFieldConfig = {
  school_name: true,
  school_address: true,
  school_contact: true,
  school_registration: false,
  student_name: true,
  student_id: true,
  grade_level: true,
  class_section: true,
  receipt_number: true,
  payment_date: true,
  payment_method: true,
  transaction_id: true,
  amount: true,
  fee_category: true,
  academic_year: true,
  term: true,
  custom_footer: false,
  watermark: false,
  signature: false,
};

export const DEFAULT_STYLE_CONFIG: ReceiptStyleConfig = {
  primary_color: '#16a34a',
  header_background: '#f9fafb',
  font_family: 'Inter',
  font_size: 'medium',
  border_style: 'solid',
  spacing: 'normal',
  text_alignment: 'left',
  currency_symbol: '$',
  decimal_places: 2,
};

export const MOCK_PREVIEW_DATA: ReceiptPreviewData = {
  school: {
    name: 'Greenwood High School',
    address: '123 Education Street, Learning City, LC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@greenwood.edu',
    logo_url: null,
    registration_number: 'REG-2024-001',
  },
  student: {
    name: 'John Doe',
    id: 'STU001',
    grade: 'Grade 10',
    section: 'A',
  },
  payment: {
    receipt_number: 'RCP-2024-001',
    date: 'Oct 14, 2025',
    method: 'Bank Transfer',
    transaction_id: 'TXN123456',
    amount: 15000,
    category: 'Tuition Fee',
    academic_year: '2024-2025',
    term: 'First Term',
  },
};
