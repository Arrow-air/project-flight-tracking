export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      aircraft: {
        Row: {
          aircraft_type: string | null
          created_at: string
          id: string
          name: string | null
          notes: string | null
          owner_id: string | null
          serial_number: string
          updated_at: string
        }
        Insert: {
          aircraft_type?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          owner_id?: string | null
          serial_number: string
          updated_at?: string
        }
        Update: {
          aircraft_type?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          owner_id?: string | null
          serial_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aircraft_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_hardware: {
        Row: {
          aircraft_id: string
          created_at: string
          id: string
          json: Json | null
          updated_at: string
        }
        Insert: {
          aircraft_id: string
          created_at?: string
          id?: string
          json?: Json | null
          updated_at?: string
        }
        Update: {
          aircraft_id?: string
          created_at?: string
          id?: string
          json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_hardware_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
        ]
      }
      aircraft_maintenance_log: {
        Row: {
          aircraft_id: string | null
          author_id: string | null
          created_at: string
          id: string
          log_date: string | null
          log_type: Database["public"]["Enums"]["maintenance_log_type"]
          notes: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          aircraft_id?: string | null
          author_id?: string | null
          created_at?: string
          id?: string
          log_date?: string | null
          log_type: Database["public"]["Enums"]["maintenance_log_type"]
          notes?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          aircraft_id?: string | null
          author_id?: string | null
          created_at?: string
          id?: string
          log_date?: string | null
          log_type?: Database["public"]["Enums"]["maintenance_log_type"]
          notes?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_maintenance_log_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aircraft_maintenance_log_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aircraft_maintenance_log_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_leg_logs: {
        Row: {
          bucket: string
          checksum_sha256: string | null
          content_type: string | null
          created_at: string
          filename: string
          flight_leg_id: string | null
          id: string
          notes: string | null
          object_path: string
          size_bytes: number | null
          updated_at: string
          uploaded_by_id: string | null
        }
        Insert: {
          bucket?: string
          checksum_sha256?: string | null
          content_type?: string | null
          created_at?: string
          filename: string
          flight_leg_id?: string | null
          id?: string
          notes?: string | null
          object_path: string
          size_bytes?: number | null
          updated_at?: string
          uploaded_by_id?: string | null
        }
        Update: {
          bucket?: string
          checksum_sha256?: string | null
          content_type?: string | null
          created_at?: string
          filename?: string
          flight_leg_id?: string | null
          id?: string
          notes?: string | null
          object_path?: string
          size_bytes?: number | null
          updated_at?: string
          uploaded_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_leg_logs_flight_leg_id_fkey"
            columns: ["flight_leg_id"]
            isOneToOne: false
            referencedRelation: "flight_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_logs_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_logs_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_leg_tags: {
        Row: {
          created_at: string
          id: string
          leg_id: string
          tag_id: string
          tagged_by_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          leg_id: string
          tag_id: string
          tagged_by_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          leg_id?: string
          tag_id?: string
          tagged_by_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_leg_tags_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "flight_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_tags_tagged_by_id_fkey"
            columns: ["tagged_by_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_tags_tagged_by_id_fkey"
            columns: ["tagged_by_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_legs: {
        Row: {
          aircraft_id: string
          altitude_m: number | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          pilot_id: string
          temp_c: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          aircraft_id: string
          altitude_m?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          pilot_id: string
          temp_c?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          aircraft_id?: string
          altitude_m?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          pilot_id?: string
          temp_c?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_legs_aircraft_id_fkey"
            columns: ["aircraft_id"]
            isOneToOne: false
            referencedRelation: "aircraft"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_legs_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_legs_pilot_id_fkey"
            columns: ["pilot_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_notes: {
        Row: {
          author_id: string | null
          created_at: string
          flight_leg_id: string | null
          id: string
          note_type: Database["public"]["Enums"]["flight_note_type"]
          notes: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          flight_leg_id?: string | null
          id?: string
          note_type: Database["public"]["Enums"]["flight_note_type"]
          notes?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          flight_leg_id?: string | null
          id?: string
          note_type?: Database["public"]["Enums"]["flight_note_type"]
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_notes_flight_leg_id_fkey"
            columns: ["flight_leg_id"]
            isOneToOne: false
            referencedRelation: "flight_legs"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["organization_member_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_member_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["organization_member_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "client_user_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          created_by_id: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_custom_avatar: boolean
          is_deactivated: boolean
          last_login_at: string | null
          onboarding_completed: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_custom_avatar?: boolean
          is_deactivated?: boolean
          last_login_at?: string | null
          onboarding_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_custom_avatar?: boolean
          is_deactivated?: boolean
          last_login_at?: string | null
          onboarding_completed?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_ui_settings: {
        Row: {
          created_at: string | null
          id: string
          locale: string | null
          preferred_theme: Database["public"]["Enums"]["user_theme"]
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          locale?: string | null
          preferred_theme?: Database["public"]["Enums"]["user_theme"]
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          locale?: string | null
          preferred_theme?: Database["public"]["Enums"]["user_theme"]
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ui_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ui_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_organization_members: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string | null
          last_seen_at: string | null
          locale: string | null
          member_since: string | null
          member_updated_at: string | null
          organization_id: string | null
          organization_name: string | null
          role: Database["public"]["Enums"]["organization_member_role"] | null
          timezone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "client_user_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_user_organizations: {
        Row: {
          created_at: string | null
          description: string | null
          email: string | null
          id: string | null
          member_role:
            | Database["public"]["Enums"]["organization_member_role"]
            | null
          member_since: string | null
          membership_updated_at: string | null
          name: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_custom_avatar: boolean | null
          is_deactivated: boolean | null
          last_login_at: string | null
          locale: string | null
          onboarding_completed: boolean | null
          preferred_theme: Database["public"]["Enums"]["user_theme"] | null
          timezone: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      flight_leg_tags_with_tags: {
        Row: {
          created_at: string | null
          id: string | null
          leg_id: string | null
          tag_description: string | null
          tag_id: string | null
          tag_name: string | null
          tagged_by_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_leg_tags_leg_id_fkey"
            columns: ["leg_id"]
            isOneToOne: false
            referencedRelation: "flight_legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_tags_tagged_by_id_fkey"
            columns: ["tagged_by_id"]
            isOneToOne: false
            referencedRelation: "client_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_leg_tags_tagged_by_id_fkey"
            columns: ["tagged_by_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      user_is_org_admin: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      user_is_org_member: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
      user_is_org_owner: {
        Args: { p_organization_id: string }
        Returns: boolean
      }
    }
    Enums: {
      flight_note_type: "pilot" | "admin" | "engineer" | "witness" | "other"
      maintenance_log_type:
        | "build"
        | "maintenance"
        | "upgrade"
        | "repair"
        | "trouble-shooting"
        | "ground-run"
        | "other"
      organization_member_role: "owner" | "admin" | "member"
      user_role: "super_admin" | "admin" | "moderator" | "user"
      user_theme: "light" | "dark" | "system"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      flight_note_type: ["pilot", "admin", "engineer", "witness", "other"],
      maintenance_log_type: [
        "build",
        "maintenance",
        "upgrade",
        "repair",
        "trouble-shooting",
        "ground-run",
        "other",
      ],
      organization_member_role: ["owner", "admin", "member"],
      user_role: ["super_admin", "admin", "moderator", "user"],
      user_theme: ["light", "dark", "system"],
    },
  },
} as const

