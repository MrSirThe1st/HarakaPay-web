export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          role: "admin" | "school_staff";
          school_id: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          role: "admin" | "school_staff";
          school_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: "admin" | "school_staff";
          school_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          registration_number: string | null;
          status: "pending" | "approved" | "suspended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          registration_number?: string | null;
          status?: "pending" | "approved" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          registration_number?: string | null;
          status?: "pending" | "approved" | "suspended";
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          first_name: string;
          last_name: string;
          grade_level: string | null;
          enrollment_date: string;
          status: "active" | "inactive" | "graduated";
          parent_name: string | null;
          parent_phone: string | null;
          parent_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          first_name: string;
          last_name: string;
          grade_level?: string | null;
          enrollment_date?: string;
          status?: "active" | "inactive" | "graduated";
          parent_name?: string | null;
          parent_phone?: string | null;
          parent_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          student_id?: string;
          first_name?: string;
          last_name?: string;
          grade_level?: string | null;
          enrollment_date?: string;
          status?: "active" | "inactive" | "graduated";
          parent_name?: string | null;
          parent_phone?: string | null;
          parent_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          student_id: string;
          amount: number;
          payment_date: string;
          payment_method: "cash" | "bank_transfer" | "mobile_money";
          status: "pending" | "completed" | "failed";
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          amount: number;
          payment_date?: string;
          payment_method: "cash" | "bank_transfer" | "mobile_money";
          status?: "pending" | "completed" | "failed";
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          amount?: number;
          payment_date?: string;
          payment_method?: "cash" | "bank_transfer" | "mobile_money";
          status?: "pending" | "completed" | "failed";
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "school_staff";
      school_status: "pending" | "approved" | "suspended";
      payment_status: "pending" | "completed" | "failed";
      payment_method: "cash" | "bank_transfer" | "mobile_money";
      student_status: "active" | "inactive" | "graduated";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
