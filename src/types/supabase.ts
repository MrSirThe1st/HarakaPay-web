export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      academic_terms: {
        Row: {
          academic_year_id: string
          created_at: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          term_order: number
          term_type: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          term_order: number
          term_type: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          term_order?: number
          term_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          school_id: string
          start_date: string
          term_structure: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          school_id: string
          start_date: string
          term_structure: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          school_id?: string
          start_date?: string
          term_structure?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          change_details: Json
          change_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          expires_at: string | null
          id: string
          received_approvals: Json | null
          requester_id: string | null
          required_approvals: Json
          status: string | null
          updated_at: string | null
        }
        Insert: {
          change_details: Json
          change_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          expires_at?: string | null
          id?: string
          received_approvals?: Json | null
          requester_id?: string | null
          required_approvals: Json
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          change_details?: Json
          change_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          expires_at?: string | null
          id?: string
          received_approvals?: Json | null
          requester_id?: string | null
          required_approvals?: Json
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_workflows_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fee_adjustments: {
        Row: {
          adjustment_type: string
          amount: number
          assignment_id: string
          created_at: string | null
          created_by: string | null
          effective_date: string
          expires_date: string | null
          id: string
          is_active: boolean | null
          reason: string
        }
        Insert: {
          adjustment_type: string
          amount: number
          assignment_id: string
          created_at?: string | null
          created_by?: string | null
          effective_date: string
          expires_date?: string | null
          id?: string
          is_active?: boolean | null
          reason: string
        }
        Update: {
          adjustment_type?: string
          amount?: number
          assignment_id?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          expires_date?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_adjustments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "student_fee_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_audit_trail: {
        Row: {
          action: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          performed_at: string | null
          performed_by: string | null
          school_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          school_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          school_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_audit_trail_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_categories: {
        Row: {
          category_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          is_recurring: boolean | null
          name: string
          school_id: string
          supports_one_time: boolean
          updated_at: string | null
        }
        Insert: {
          category_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          is_recurring?: boolean | null
          name: string
          school_id: string
          supports_one_time?: boolean
          updated_at?: string | null
        }
        Update: {
          category_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          is_recurring?: boolean | null
          name?: string
          school_id?: string
          supports_one_time?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure_items: {
        Row: {
          amount: number
          category_id: string
          created_at: string | null
          id: string
          is_mandatory: boolean | null
          is_recurring: boolean | null
          payment_modes: Json | null
          structure_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          is_recurring?: boolean | null
          payment_modes?: Json | null
          structure_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          is_recurring?: boolean | null
          payment_modes?: Json | null
          structure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structure_items_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string
          applies_to: string
          created_at: string | null
          created_by: string | null
          grade_level: string
          id: string
          is_active: boolean | null
          is_published: boolean | null
          name: string
          school_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          applies_to?: string
          created_at?: string | null
          created_by?: string | null
          grade_level: string
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          name: string
          school_id: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          applies_to?: string
          created_at?: string | null
          created_by?: string | null
          grade_level?: string
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          name?: string
          school_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      hire_records: {
        Row: {
          actual_return_date: string | null
          created_at: string | null
          deposit_paid: number | null
          deposit_returned: boolean | null
          expected_return_date: string
          hire_end_date: string
          hire_start_date: string
          id: string
          late_fees: number | null
          notes: string | null
          order_item_id: string
          status: Database["public"]["Enums"]["hire_status"] | null
          updated_at: string | null
        }
        Insert: {
          actual_return_date?: string | null
          created_at?: string | null
          deposit_paid?: number | null
          deposit_returned?: boolean | null
          expected_return_date: string
          hire_end_date: string
          hire_start_date: string
          id?: string
          late_fees?: number | null
          notes?: string | null
          order_item_id: string
          status?: Database["public"]["Enums"]["hire_status"] | null
          updated_at?: string | null
        }
        Update: {
          actual_return_date?: string | null
          created_at?: string | null
          deposit_paid?: number | null
          deposit_returned?: boolean | null
          expected_return_date?: string
          hire_end_date?: string
          hire_start_date?: string
          id?: string
          late_fees?: number | null
          notes?: string | null
          order_item_id?: string
          status?: Database["public"]["Enums"]["hire_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hire_records_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "store_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      hire_settings: {
        Row: {
          created_at: string | null
          deposit_amount: number | null
          duration_type: Database["public"]["Enums"]["duration_type"]
          id: string
          item_id: string
          late_fee_per_day: number | null
          max_duration_days: number
          min_duration_days: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deposit_amount?: number | null
          duration_type: Database["public"]["Enums"]["duration_type"]
          id?: string
          item_id: string
          late_fee_per_day?: number | null
          max_duration_days: number
          min_duration_days: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deposit_amount?: number | null
          duration_type?: Database["public"]["Enums"]["duration_type"]
          id?: string
          item_id?: string
          late_fee_per_day?: number | null
          max_duration_days?: number
          min_duration_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hire_settings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_recipients: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivery_channel: string | null
          delivery_status: string | null
          error_message: string | null
          id: string
          notification_id: string | null
          parent_id: string | null
          read_at: string | null
          student_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          parent_id?: string | null
          read_at?: string | null
          student_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          parent_id?: string | null
          read_at?: string | null
          student_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipients_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_recipients_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_recipients_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_channel: string | null
          scheduled_at: string | null
          school_id: string | null
          sent_at: string | null
          target_audience: Json | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_channel?: string | null
          scheduled_at?: string | null
          school_id?: string | null
          sent_at?: string | null
          target_audience?: Json | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_channel?: string | null
          scheduled_at?: string | null
          school_id?: string | null
          sent_at?: string | null
          target_audience?: Json | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_school_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          parent_id: string
          read_at: string | null
          school_id: string
          status: string | null
          student_id: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          parent_id: string
          read_at?: string | null
          school_id: string
          status?: string | null
          student_id: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          parent_id?: string
          read_at?: string | null
          school_id?: string
          status?: string | null
          student_id?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_school_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_school_messages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_school_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_students: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          parent_id: string | null
          relationship: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          parent_id?: string | null
          relationship?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          parent_id?: string | null
          relationship?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_fee_rate_history: {
        Row: {
          change_details: Json | null
          change_type: string
          changed_by: string | null
          created_at: string
          fee_percentage: number
          id: string
          rate_id: string
          school_id: string
          status: string
        }
        Insert: {
          change_details?: Json | null
          change_type: string
          changed_by?: string | null
          created_at?: string
          fee_percentage: number
          id?: string
          rate_id: string
          school_id: string
          status: string
        }
        Update: {
          change_details?: Json | null
          change_type?: string
          changed_by?: string | null
          created_at?: string
          fee_percentage?: number
          id?: string
          rate_id?: string
          school_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_fee_rate_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_fee_rate_history_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "payment_fee_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_fee_rate_history_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_fee_rates: {
        Row: {
          admin_approved_at: string | null
          admin_approved_by: string | null
          created_at: string
          effective_from: string
          effective_until: string | null
          expires_at: string | null
          fee_percentage: number
          id: string
          proposed_by_id: string
          proposed_by_role: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          school_approved_at: string | null
          school_approved_by: string | null
          school_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          expires_at?: string | null
          fee_percentage: number
          id?: string
          proposed_by_id: string
          proposed_by_role: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          school_approved_at?: string | null
          school_approved_by?: string | null
          school_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          expires_at?: string | null
          fee_percentage?: number
          id?: string
          proposed_by_id?: string
          proposed_by_role?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          school_approved_at?: string | null
          school_approved_by?: string | null
          school_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_fee_rates_admin_approved_by_fkey"
            columns: ["admin_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_fee_rates_proposed_by_id_fkey"
            columns: ["proposed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_fee_rates_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_fee_rates_school_approved_by_fkey"
            columns: ["school_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_fee_rates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          discount_percentage: number | null
          fee_category_id: string | null
          id: string
          installments: Json
          is_active: boolean | null
          school_id: string
          structure_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_percentage?: number | null
          fee_category_id?: string | null
          id?: string
          installments?: Json
          is_active?: boolean | null
          school_id: string
          structure_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_percentage?: number | null
          fee_category_id?: string | null
          id?: string
          installments?: Json
          is_active?: boolean | null
          school_id?: string
          structure_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_fee_category_id_fkey"
            columns: ["fee_category_id"]
            isOneToOne: false
            referencedRelation: "fee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          api_key: string | null
          created_at: string | null
          gateway_provider: string
          id: string
          is_active: boolean | null
          school_id: string | null
          secret_key: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          gateway_provider: string
          id?: string
          is_active?: boolean | null
          school_id?: string | null
          secret_key?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          gateway_provider?: string
          id?: string
          is_active?: boolean | null
          school_id?: string | null
          secret_key?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_paid: number
          created_at: string | null
          id: string
          installment_label: string | null
          installment_number: number | null
          mpesa_transaction_id: string | null
          notes: string | null
          payment_id: string | null
          payment_plan_id: string | null
          student_fee_assignment_id: string | null
          transaction_status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          id?: string
          installment_label?: string | null
          installment_number?: number | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          payment_id?: string | null
          payment_plan_id?: string | null
          student_fee_assignment_id?: string | null
          transaction_status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          id?: string
          installment_label?: string | null
          installment_number?: number | null
          mpesa_transaction_id?: string | null
          notes?: string | null
          payment_id?: string | null
          payment_plan_id?: string | null
          student_fee_assignment_id?: string | null
          transaction_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_student_fee_assignment_id_fkey"
            columns: ["student_fee_assignment_id"]
            isOneToOne: false
            referencedRelation: "student_fee_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          installment_number: number | null
          mpesa_conversation_id: string | null
          mpesa_third_party_id: string | null
          parent_id: string | null
          payment_date: string | null
          payment_gateway_response: Json | null
          payment_method: string | null
          receipt_url: string | null
          status: string | null
          student_id: string | null
          transaction_reference: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          installment_number?: number | null
          mpesa_conversation_id?: string | null
          mpesa_third_party_id?: string | null
          parent_id?: string | null
          payment_date?: string | null
          payment_gateway_response?: Json | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          student_id?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          installment_number?: number | null
          mpesa_conversation_id?: string | null
          mpesa_third_party_id?: string | null
          parent_id?: string | null
          payment_date?: string | null
          payment_gateway_response?: Json | null
          payment_method?: string | null
          receipt_url?: string | null
          status?: string | null
          student_id?: string | null
          transaction_reference?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_type: string | null
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          gender: string | null
          home_address: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          permissions: Json | null
          phone: string | null
          position: string | null
          role: string
          school_id: string | null
          staff_id: string | null
          updated_at: string | null
          user_id: string | null
          work_email: string | null
        }
        Insert: {
          admin_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          home_address?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          permissions?: Json | null
          phone?: string | null
          position?: string | null
          role?: string
          school_id?: string | null
          staff_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
        }
        Update: {
          admin_type?: string | null
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          home_address?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          permissions?: Json | null
          phone?: string | null
          position?: string | null
          role?: string
          school_id?: string | null
          staff_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
        }
        Relationships: []
      }
      push_notification_tokens: {
        Row: {
          created_at: string | null
          device_name: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          parent_id: string | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          parent_id?: string | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          parent_id?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_tokens_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          logo_position: string | null
          school_id: string
          show_logo: boolean | null
          style_config: Json
          template_name: string
          template_type: string
          updated_at: string | null
          visible_fields: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          logo_position?: string | null
          school_id: string
          show_logo?: boolean | null
          style_config?: Json
          template_name: string
          template_type: string
          updated_at?: string | null
          visible_fields?: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          logo_position?: string | null
          school_id?: string
          show_logo?: boolean | null
          style_config?: Json
          template_name?: string
          template_type?: string
          updated_at?: string | null
          visible_fields?: Json
        }
        Relationships: [
          {
            foreignKeyName: "receipt_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_notifications: {
        Row: {
          body: string
          category: string | null
          created_at: string | null
          created_by: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          next_send_at: string | null
          schedule_date: string | null
          schedule_days: number[] | null
          schedule_time: string | null
          school_id: string | null
          subject: string | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          body?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_send_at?: string | null
          schedule_date?: string | null
          schedule_days?: number[] | null
          schedule_time?: string | null
          school_id?: string | null
          subject?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_send_at?: string | null
          schedule_date?: string | null
          schedule_days?: number[] | null
          schedule_time?: string | null
          school_id?: string | null
          subject?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_notifications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_admin_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          school_id: string
          sent_by: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          school_id: string
          sent_by: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          school_id?: string
          sent_by?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_admin_messages_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_admin_messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_registration_requests: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          contact_person_email: string
          contact_person_name: string
          contact_person_phone: string | null
          created_at: string | null
          existing_systems: string[] | null
          fee_schedules: string[] | null
          grade_levels: string[] | null
          has_mpesa_account: boolean | null
          id: string
          registration_number: string
          reviewed_by: string | null
          school_address: string
          school_email: string
          school_levels: string[] | null
          school_name: string
          school_size: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          contact_person_email: string
          contact_person_name: string
          contact_person_phone?: string | null
          created_at?: string | null
          existing_systems?: string[] | null
          fee_schedules?: string[] | null
          grade_levels?: string[] | null
          has_mpesa_account?: boolean | null
          id?: string
          registration_number: string
          reviewed_by?: string | null
          school_address: string
          school_email: string
          school_levels?: string[] | null
          school_name: string
          school_size?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          contact_person_email?: string
          contact_person_name?: string
          contact_person_phone?: string | null
          created_at?: string | null
          existing_systems?: string[] | null
          fee_schedules?: string[] | null
          grade_levels?: string[] | null
          has_mpesa_account?: boolean | null
          id?: string
          registration_number?: string
          reviewed_by?: string | null
          school_address?: string
          school_email?: string
          school_levels?: string[] | null
          school_name?: string
          school_size?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          currency: string | null
          grade_levels: string[] | null
          id: string
          logo_url: string | null
          name: string
          payment_provider: string | null
          payment_provider_config: Json | null
          payment_transparency: Json | null
          registration_number: string | null
          status: string | null
          updated_at: string | null
          verification_date: string | null
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          grade_levels?: string[] | null
          id?: string
          logo_url?: string | null
          name: string
          payment_provider?: string | null
          payment_provider_config?: Json | null
          payment_transparency?: Json | null
          registration_number?: string | null
          status?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          currency?: string | null
          grade_levels?: string[] | null
          id?: string
          logo_url?: string | null
          name?: string
          payment_provider?: string | null
          payment_provider_config?: Json | null
          payment_transparency?: Json | null
          registration_number?: string | null
          status?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_requests: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          message: string | null
          parent_id: string
          requested_quantity: number
          status: Database["public"]["Enums"]["request_status"] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          message?: string | null
          parent_id: string
          requested_quantity: number
          status?: Database["public"]["Enums"]["request_status"] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          message?: string | null
          parent_id?: string
          requested_quantity?: number
          status?: Database["public"]["Enums"]["request_status"] | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      store_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      store_items: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          is_available: boolean | null
          item_type: Database["public"]["Enums"]["item_type"]
          low_stock_threshold: number | null
          name: string
          price: number
          school_id: string
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_available?: boolean | null
          item_type: Database["public"]["Enums"]["item_type"]
          low_stock_threshold?: number | null
          name: string
          price: number
          school_id: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_available?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"]
          low_stock_threshold?: number | null
          name?: string
          price?: number
          school_id?: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "store_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      store_order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          order_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          order_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          order_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          parent_id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          school_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          student_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          parent_id: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          school_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          student_id: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          parent_id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          school_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          student_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_orders_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_orders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_assignments: {
        Row: {
          academic_year_id: string
          assigned_at: string | null
          assigned_by: string | null
          id: string
          notes: string | null
          paid_amount: number | null
          payment_plan_id: string | null
          status: string | null
          structure_id: string | null
          student_id: string
          total_due: number | null
        }
        Insert: {
          academic_year_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_plan_id?: string | null
          status?: string | null
          structure_id?: string | null
          student_id: string
          total_due?: number | null
        }
        Update: {
          academic_year_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_plan_id?: string | null
          status?: string | null
          structure_id?: string | null
          student_id?: string
          total_due?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_fee_assignments_payment_plan"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_student_fee_assignments_structure"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fee_payments: {
        Row: {
          amount: number
          assignment_id: string
          created_at: string | null
          created_by: string | null
          id: string
          installment_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          status: string | null
        }
        Insert: {
          amount: number
          assignment_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          installment_id?: string | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          assignment_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          installment_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_payments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "student_fee_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fee_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          chronic_conditions: string[] | null
          created_at: string | null
          date_of_birth: string | null
          enrollment_date: string | null
          first_name: string
          gender: string | null
          grade_level: string | null
          guardian_relationship: string | null
          home_address: string | null
          id: string
          last_name: string
          level: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          school_id: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          enrollment_date?: string | null
          first_name: string
          gender?: string | null
          grade_level?: string | null
          guardian_relationship?: string | null
          home_address?: string | null
          id?: string
          last_name: string
          level?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          enrollment_date?: string | null
          first_name?: string
          gender?: string | null
          grade_level?: string | null
          guardian_relationship?: string | null
          home_address?: string | null
          id?: string
          last_name?: string
          level?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_fee_snapshots: {
        Row: {
          base_amount: number
          created_at: string
          fee_amount: number
          fee_percentage: number
          fee_rate_id: string | null
          id: string
          locked_at: string
          payment_id: string
          payment_method: string
          payment_status: string
          school_id: string
          student_id: string
          total_amount: number
        }
        Insert: {
          base_amount: number
          created_at?: string
          fee_amount: number
          fee_percentage: number
          fee_rate_id?: string | null
          id?: string
          locked_at?: string
          payment_id: string
          payment_method: string
          payment_status: string
          school_id: string
          student_id: string
          total_amount: number
        }
        Update: {
          base_amount?: number
          created_at?: string
          fee_amount?: number
          fee_percentage?: number
          fee_rate_id?: string | null
          id?: string
          locked_at?: string
          payment_id?: string
          payment_method?: string
          payment_status?: string
          school_id?: string
          student_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_fee_snapshots_fee_rate_id_fkey"
            columns: ["fee_rate_id"]
            isOneToOne: false
            referencedRelation: "payment_fee_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_fee_snapshots_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_fee_snapshots_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_fee_snapshots_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      debug_user_context: {
        Args: never
        Returns: {
          current_user_id: string
          is_parent: boolean
          school_id: string
          user_role: string
        }[]
      }
      expire_pending_fee_proposals: { Args: never; Returns: undefined }
      generate_order_number: { Args: never; Returns: string }
      get_active_payment_fee_rate: {
        Args: { p_school_id: string }
        Returns: number
      }
      get_user_role: { Args: { user_uuid: string }; Returns: string }
      get_user_school: { Args: { user_id: string }; Returns: string }
    }
    Enums: {
      duration_type:
        | "daily"
        | "weekly"
        | "monthly"
        | "per_term"
        | "per_year"
        | "custom"
      hire_status: "active" | "returned" | "overdue" | "lost"
      item_type: "sale" | "hire"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      order_type: "purchase" | "hire"
      payment_status: "pending" | "paid" | "refunded"
      request_status: "pending" | "acknowledged" | "fulfilled" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      duration_type: [
        "daily",
        "weekly",
        "monthly",
        "per_term",
        "per_year",
        "custom",
      ],
      hire_status: ["active", "returned", "overdue", "lost"],
      item_type: ["sale", "hire"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      order_type: ["purchase", "hire"],
      payment_status: ["pending", "paid", "refunded"],
      request_status: ["pending", "acknowledged", "fulfilled", "cancelled"],
    },
  },
} as const
