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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          ai_generated: boolean | null
          alert_type: string | null
          created_at: string | null
          description: string | null
          device_id: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          suggested_action: string | null
          tenant_id: string | null
          title: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_generated?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          suggested_action?: string | null
          tenant_id?: string | null
          title?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_generated?: boolean | null
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          suggested_action?: string | null
          tenant_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          id: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_results: {
        Row: {
          checked_at: string | null
          device_id: string | null
          id: string
          passed: boolean | null
          rule_id: string | null
        }
        Insert: {
          checked_at?: string | null
          device_id?: string | null
          id?: string
          passed?: boolean | null
          rule_id?: string | null
        }
        Update: {
          checked_at?: string | null
          device_id?: string | null
          id?: string
          passed?: boolean | null
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_results_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_results_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      device_metrics: {
        Row: {
          cpu_usage: number | null
          device_id: string | null
          disk_usage: number | null
          id: string
          memory_usage: number | null
          recorded_at: string | null
        }
        Insert: {
          cpu_usage?: number | null
          device_id?: string | null
          disk_usage?: number | null
          id?: string
          memory_usage?: number | null
          recorded_at?: string | null
        }
        Update: {
          cpu_usage?: number | null
          device_id?: string | null
          disk_usage?: number | null
          id?: string
          memory_usage?: number | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_metrics_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          compliance_score: number | null
          cpu_model: string | null
          created_at: string | null
          department: string | null
          disk_capacity_gb: number | null
          hardware_id: string | null
          id: string
          ip_address: string | null
          last_seen: string | null
          name: string | null
          os: string | null
          os_version: string | null
          ram_gb: number | null
          status: string | null
          tenant_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          compliance_score?: number | null
          cpu_model?: string | null
          created_at?: string | null
          department?: string | null
          disk_capacity_gb?: number | null
          hardware_id?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          name?: string | null
          os?: string | null
          os_version?: string | null
          ram_gb?: number | null
          status?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          compliance_score?: number | null
          cpu_model?: string | null
          created_at?: string | null
          department?: string | null
          disk_capacity_gb?: number | null
          hardware_id?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          name?: string | null
          os?: string | null
          os_version?: string | null
          ram_gb?: number | null
          status?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      installed_software: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          installed_at: string | null
          software_name: string
          version: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          installed_at?: string | null
          software_name: string
          version?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          installed_at?: string | null
          software_name?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installed_software_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_suggestions: {
        Row: {
          created_at: string | null
          description: string | null
          device_id: string | null
          id: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_suggestions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_suggestions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      msp_support_sessions: {
        Row: {
          activated_at: string | null
          deactivated_at: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          msp_user_id: string | null
          tenant_id: string | null
        }
        Insert: {
          activated_at?: string | null
          deactivated_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          msp_user_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          activated_at?: string | null
          deactivated_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          msp_user_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "msp_support_sessions_msp_user_id_fkey"
            columns: ["msp_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "msp_support_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      msps: {
        Row: {
          contact_email: string | null
          created_at: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      network_devices: {
        Row: {
          created_at: string | null
          hostname: string | null
          id: string
          ip_address: string | null
          last_polled: string | null
          metrics: Json | null
          name: string | null
          snmp_status: string | null
          tenant_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hostname?: string | null
          id?: string
          ip_address?: string | null
          last_polled?: string | null
          metrics?: Json | null
          name?: string | null
          snmp_status?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hostname?: string | null
          id?: string
          ip_address?: string | null
          last_polled?: string | null
          metrics?: Json | null
          name?: string | null
          snmp_status?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          msp_id: string | null
          organization_name: string | null
          password_hash: string
          phone: string | null
          role: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          msp_id?: string | null
          organization_name?: string | null
          password_hash: string
          phone?: string | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          msp_id?: string | null
          organization_name?: string | null
          password_hash?: string
          phone?: string | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      remote_actions: {
        Row: {
          action_name: string | null
          created_at: string | null
          device_id: string | null
          executed_at: string | null
          id: string
          parameters: Json | null
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          action_name?: string | null
          created_at?: string | null
          device_id?: string | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          action_name?: string | null
          created_at?: string | null
          device_id?: string | null
          executed_at?: string | null
          id?: string
          parameters?: Json | null
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_actions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remote_actions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      security_status: {
        Row: {
          checked_at: string | null
          device_id: string | null
          id: string
          status_summary: string | null
          threats_detected: Json | null
        }
        Insert: {
          checked_at?: string | null
          device_id?: string | null
          id?: string
          status_summary?: string | null
          threats_detected?: Json | null
        }
        Update: {
          checked_at?: string | null
          device_id?: string | null
          id?: string
          status_summary?: string | null
          threats_detected?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "security_status_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          billing_status: string | null
          created_at: string | null
          id: string
          monthly_fee_per_admin: number | null
          msp_id: string | null
          name: string
          registration_token: string | null
          status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          billing_status?: string | null
          created_at?: string | null
          id?: string
          monthly_fee_per_admin?: number | null
          msp_id?: string | null
          name: string
          registration_token?: string | null
          status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_status?: string | null
          created_at?: string | null
          id?: string
          monthly_fee_per_admin?: number | null
          msp_id?: string | null
          name?: string
          registration_token?: string | null
          status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_msp_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
