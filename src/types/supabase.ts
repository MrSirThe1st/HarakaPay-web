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
          role: "super_admin" | "platform_admin" | "support_admin" | "school_admin" | "school_staff" | "parent";
          admin_type: "super_admin" | "platform_admin" | "support_admin" | null;
          school_id: string | null;
          phone: string | null;
          avatar_url: string | null;
          permissions: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          role: "super_admin" | "platform_admin" | "support_admin" | "school_admin" | "school_staff" | "parent";
          admin_type?: "super_admin" | "platform_admin" | "support_admin" | null;
          school_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          permissions?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: "super_admin" | "platform_admin" | "support_admin" | "school_admin" | "school_staff";
          admin_type?: "super_admin" | "platform_admin" | "support_admin" | null;
          school_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          permissions?: Json;
          is_active?: boolean;
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
          status: "pending" | "pending_verification" | "approved" | "suspended";
          verification_status: "pending" | "verified" | "rejected";
          verification_date: string | null;
          verified_by: string | null;
          payment_transparency: Json;
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
          status?: "pending" | "pending_verification" | "approved" | "suspended";
          verification_status?: "pending" | "verified" | "rejected";
          verification_date?: string | null;
          verified_by?: string | null;
          payment_transparency?: Json;
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
          status?: "pending" | "pending_verification" | "approved" | "suspended";
          verification_status?: "pending" | "verified" | "rejected";
          verification_date?: string | null;
          verified_by?: string | null;
          payment_transparency?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      parents: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          email?: string;
          address?: string | null;
          is_active?: boolean;
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
      parent_students: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          relationship: "parent" | "guardian" | "emergency_contact";
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          student_id: string;
          relationship?: "parent" | "guardian" | "emergency_contact";
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          student_id?: string;
          relationship?: "parent" | "guardian" | "emergency_contact";
          is_primary?: boolean;
          created_at?: string;
        };
      };
      payment_settings: {
        Row: {
          id: string;
          school_id: string;
          gateway_provider: string;
          api_key: string | null;
          secret_key: string | null;
          webhook_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          gateway_provider: string;
          api_key?: string | null;
          secret_key?: string | null;
          webhook_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          gateway_provider?: string;
          api_key?: string | null;
          secret_key?: string | null;
          webhook_url?: string | null;
          is_active?: boolean;
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
          payment_method: "cash" | "bank_transfer" | "mobile_money" | "card";
          status: "pending" | "completed" | "failed" | "refunded";
          description: string | null;
          receipt_url: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          amount: number;
          payment_date?: string;
          payment_method: "cash" | "bank_transfer" | "mobile_money" | "card";
          status?: "pending" | "completed" | "failed" | "refunded";
          description?: string | null;
          receipt_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          amount?: number;
          payment_date?: string;
          payment_method?: "cash" | "bank_transfer" | "mobile_money" | "card";
          status?: "pending" | "completed" | "failed" | "refunded";
          description?: string | null;
          receipt_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: "info" | "success" | "warning" | "error";
          is_read: boolean;
          action_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: "info" | "success" | "warning" | "error";
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: "info" | "success" | "warning" | "error";
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      approval_workflows: {
        Row: {
          id: string;
          requester_id: string;
          entity_type: string;
          entity_id: string | null;
          change_type: string;
          change_details: Json;
          status: "pending" | "approved" | "rejected" | "cancelled";
          required_approvals: Json;
          received_approvals: Json;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          entity_type: string;
          entity_id?: string | null;
          change_type: string;
          change_details: Json;
          status?: "pending" | "approved" | "rejected" | "cancelled";
          required_approvals: Json;
          received_approvals?: Json;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          entity_type?: string;
          entity_id?: string | null;
          change_type?: string;
          change_details?: Json;
          status?: "pending" | "approved" | "rejected" | "cancelled";
          required_approvals?: Json;
          received_approvals?: Json;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_super_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
      is_platform_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
      is_support_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
      get_user_school: {
        Args: {
          user_id: string;
        };
        Returns: string;
      };
      is_school_admin: {
        Args: {
          user_id: string;
          school_uuid: string;
        };
        Returns: boolean;
      };
      can_access_payment_data: {
        Args: {
          user_id: string;
          school_uuid: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "super_admin" | "platform_admin" | "support_admin" | "school_admin" | "school_staff" | "parent";
      admin_type: "super_admin" | "platform_admin" | "support_admin";
      school_status: "pending" | "pending_verification" | "approved" | "suspended";
      verification_status: "pending" | "verified" | "rejected";
      payment_status: "pending" | "completed" | "failed" | "refunded";
      payment_method: "cash" | "bank_transfer" | "mobile_money" | "card";
      student_status: "active" | "inactive" | "graduated";
      notification_type: "info" | "success" | "warning" | "error";
      workflow_status: "pending" | "approved" | "rejected" | "cancelled";
      relationship_type: "parent" | "guardian" | "emergency_contact";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
