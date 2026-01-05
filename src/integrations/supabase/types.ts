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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointment_access_tokens: {
        Row: {
          appointment_id: string
          client_email: string
          created_at: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          appointment_id: string
          client_email: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Update: {
          appointment_id?: string
          client_email?: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_access_tokens_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          ai_psi_analysis: string | null
          amount_cents: number | null
          appointment_date: string
          appointment_time: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          professional_id: string
          recording_url: string | null
          session_type: string | null
          status: string | null
          transcription: Json | null
          updated_at: string
          virtual_room_code: string | null
          virtual_room_link: string | null
        }
        Insert: {
          ai_psi_analysis?: string | null
          amount_cents?: number | null
          appointment_date: string
          appointment_time: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          professional_id: string
          recording_url?: string | null
          session_type?: string | null
          status?: string | null
          transcription?: Json | null
          updated_at?: string
          virtual_room_code?: string | null
          virtual_room_link?: string | null
        }
        Update: {
          ai_psi_analysis?: string | null
          amount_cents?: number | null
          appointment_date?: string
          appointment_time?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          professional_id?: string
          recording_url?: string | null
          session_type?: string | null
          status?: string | null
          transcription?: Json | null
          updated_at?: string
          virtual_room_code?: string | null
          virtual_room_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      available_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          professional_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          professional_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_hours_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_hours_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          cloudflare_api_token: string | null
          cloudflare_zone_id: string | null
          created_at: string
          dns_verified: boolean | null
          dns_verified_at: string | null
          domain: string
          id: string
          is_primary: boolean | null
          parent_domain_id: string | null
          professional_id: string
          redirect_to: string | null
          ssl_provisioned_at: string | null
          ssl_status: string | null
          status: string
          updated_at: string
          verification_token: string
        }
        Insert: {
          cloudflare_api_token?: string | null
          cloudflare_zone_id?: string | null
          created_at?: string
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          domain: string
          id?: string
          is_primary?: boolean | null
          parent_domain_id?: string | null
          professional_id: string
          redirect_to?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string
          verification_token?: string
        }
        Update: {
          cloudflare_api_token?: string | null
          cloudflare_zone_id?: string | null
          created_at?: string
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          parent_domain_id?: string | null
          professional_id?: string
          redirect_to?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_parent_domain_id_fkey"
            columns: ["parent_domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_domains_parent_domain_id_fkey"
            columns: ["parent_domain_id"]
            isOneToOne: false
            referencedRelation: "public_active_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          card_api_key: string | null
          card_enabled: boolean | null
          card_gateway: string | null
          created_at: string
          gateway_type: string
          id: string
          installments_enabled: boolean | null
          is_active: boolean | null
          max_installments: number | null
          pix_key: string | null
          pix_key_type: string | null
          professional_id: string
          updated_at: string
        }
        Insert: {
          card_api_key?: string | null
          card_enabled?: boolean | null
          card_gateway?: string | null
          created_at?: string
          gateway_type: string
          id?: string
          installments_enabled?: boolean | null
          is_active?: boolean | null
          max_installments?: number | null
          pix_key?: string | null
          pix_key_type?: string | null
          professional_id: string
          updated_at?: string
        }
        Update: {
          card_api_key?: string | null
          card_enabled?: boolean | null
          card_gateway?: string | null
          created_at?: string
          gateway_type?: string
          id?: string
          installments_enabled?: boolean | null
          is_active?: boolean | null
          max_installments?: number | null
          pix_key?: string | null
          pix_key_type?: string | null
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateways_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_gateways_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          crp: string | null
          email: string | null
          full_name: string | null
          id: string
          is_professional: boolean | null
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          crp?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_professional?: boolean | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          crp?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_professional?: boolean | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          checkout_config: Json
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          product_config: Json
          professional_id: string
          updated_at: string
        }
        Insert: {
          checkout_config?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          product_config?: Json
          professional_id: string
          updated_at?: string
        }
        Update: {
          checkout_config?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          product_config?: Json
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string
          customer_cpf: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          gateway: string
          gateway_payment_id: string | null
          gateway_response: Json | null
          id: string
          payment_method: string
          payment_status: string
          pix_code: string | null
          pix_qr_code: string | null
          professional_id: string
          service_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          customer_cpf?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method: string
          payment_status?: string
          pix_code?: string | null
          pix_qr_code?: string | null
          professional_id: string
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string
          payment_status?: string
          pix_code?: string | null
          pix_qr_code?: string | null
          professional_id?: string
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_rooms: {
        Row: {
          answer: Json | null
          created_at: string
          expires_at: string
          id: string
          offer: Json | null
          patient_name: string | null
          professional_id: string
          room_code: string
          status: string | null
          updated_at: string
        }
        Insert: {
          answer?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          offer?: Json | null
          patient_name?: string | null
          professional_id: string
          room_code: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          answer?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          offer?: Json | null
          patient_name?: string | null
          professional_id?: string
          room_code?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          confirmation_enabled: boolean | null
          created_at: string
          evolution_api_key: string | null
          evolution_api_url: string | null
          evolution_instance_name: string | null
          id: string
          is_active: boolean | null
          professional_id: string
          reminder_enabled: boolean | null
          reminder_hours_before: number | null
          updated_at: string
        }
        Insert: {
          confirmation_enabled?: boolean | null
          created_at?: string
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          id?: string
          is_active?: boolean | null
          professional_id: string
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          updated_at?: string
        }
        Update: {
          confirmation_enabled?: boolean | null
          created_at?: string
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          id?: string
          is_active?: boolean | null
          professional_id?: string
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_settings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_active_domains: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string | null
          is_primary: boolean | null
          professional_id: string | null
          ssl_status: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string | null
          is_primary?: boolean | null
          professional_id?: string | null
          ssl_status?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string | null
          is_primary?: boolean | null
          professional_id?: string | null
          ssl_status?: string | null
        }
        Relationships: []
      }
      public_professional_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          crp: string | null
          full_name: string | null
          id: string | null
          is_professional: boolean | null
          specialty: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crp?: string | null
          full_name?: string | null
          id?: string | null
          is_professional?: boolean | null
          specialty?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crp?: string | null
          full_name?: string | null
          id?: string | null
          is_professional?: boolean | null
          specialty?: string | null
        }
        Relationships: []
      }
      public_services: {
        Row: {
          checkout_config: Json | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string | null
          is_active: boolean | null
          name: string | null
          price_cents: number | null
          product_config: Json | null
          professional_id: string | null
        }
        Insert: {
          checkout_config?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          price_cents?: number | null
          product_config?: Json | null
          professional_id?: string | null
        }
        Update: {
          checkout_config?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          price_cents?: number | null
          product_config?: Json | null
          professional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_professional_contact: {
        Args: { professional_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
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
