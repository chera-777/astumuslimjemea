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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string
          id: string
          pinned: boolean
          title: string
          university_id: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string
          created_by: string
          id?: string
          pinned?: boolean
          title: string
          university_id: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          pinned?: boolean
          title?: string
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          meta: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolver_id: string | null
          resolver_note: string | null
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          resolver_id?: string | null
          resolver_note?: string | null
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolver_id?: string | null
          resolver_note?: string | null
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign: string | null
          created_at: string
          donor_id: string | null
          id: string
          is_anonymous: boolean | null
          university_id: string
        }
        Insert: {
          amount: number
          campaign?: string | null
          created_at?: string
          donor_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          university_id: string
        }
        Update: {
          amount?: number
          campaign?: string | null
          created_at?: string
          donor_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_published: boolean
          location: string | null
          starts_at: string
          title: string
          university_id: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          capacity?: number | null
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string | null
          starts_at: string
          title: string
          university_id: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          capacity?: number | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string | null
          starts_at?: string
          title?: string
          university_id?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      khadim_registrations: {
        Row: {
          availability_notes: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          period: string
          preferred_roles: string[] | null
          university_id: string
          user_id: string
        }
        Insert: {
          availability_notes?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          period: string
          preferred_roles?: string[] | null
          university_id: string
          user_id: string
        }
        Update: {
          availability_notes?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          period?: string
          preferred_roles?: string[] | null
          university_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "khadim_registrations_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      khadim_schedule: {
        Row: {
          assigned_date: string
          assigned_role: string
          created_at: string
          id: string
          khadim_id: string
          meal_type: string
          university_id: string
        }
        Insert: {
          assigned_date: string
          assigned_role: string
          created_at?: string
          id?: string
          khadim_id: string
          meal_type: string
          university_id: string
        }
        Update: {
          assigned_date?: string
          assigned_role?: string
          created_at?: string
          id?: string
          khadim_id?: string
          meal_type?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "khadim_schedule_khadim_id_fkey"
            columns: ["khadim_id"]
            isOneToOne: false
            referencedRelation: "khadim_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadim_schedule_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room: string
          university_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room?: string
          university_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room?: string
          university_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string
          content: string | null
          created_at: string
          id: string
          is_featured: boolean | null
          summary: string | null
          title: string
          university_id: string
        }
        Insert: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          summary?: string | null
          title: string
          university_id: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          summary?: string | null
          title?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          deep_link: string | null
          id: string
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          deep_link?: string | null
          id?: string
          read_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          deep_link?: string | null
          id?: string
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_times_cache: {
        Row: {
          city: string
          country: string
          created_at: string
          date: string
          hijri_date: string | null
          id: string
          method: number
          timings: Json
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          date: string
          hijri_date?: string | null
          id?: string
          method?: number
          timings: Json
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          date?: string
          hijri_date?: string | null
          id?: string
          method?: number
          timings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          batch_year: string | null
          created_at: string
          department: string | null
          full_name: string
          gender: string
          id: string
          id_card_url: string | null
          is_cafe_student: boolean | null
          is_verified: boolean | null
          level: number
          phone: string | null
          profile_photo_url: string | null
          student_id: string | null
          university_id: string
          updated_at: string
          xp: number
        }
        Insert: {
          batch_year?: string | null
          created_at?: string
          department?: string | null
          full_name: string
          gender: string
          id: string
          id_card_url?: string | null
          is_cafe_student?: boolean | null
          is_verified?: boolean | null
          level?: number
          phone?: string | null
          profile_photo_url?: string | null
          student_id?: string | null
          university_id: string
          updated_at?: string
          xp?: number
        }
        Update: {
          batch_year?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          gender?: string
          id?: string
          id_card_url?: string | null
          is_cafe_student?: boolean | null
          is_verified?: boolean | null
          level?: number
          phone?: string | null
          profile_photo_url?: string | null
          student_id?: string | null
          university_id?: string
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          device_info: Json
          id: string
          last_seen_at: string
          onesignal_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json
          id?: string
          last_seen_at?: string
          onesignal_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json
          id?: string
          last_seen_at?: string
          onesignal_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          city: string
          created_at: string
          id: string
          name: string
          short_name: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          name: string
          short_name: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          name?: string
          short_name?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          sector: string | null
          university_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          sector?: string | null
          university_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          sector?: string | null
          university_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          created_at: string
          delta: number
          id: string
          meta: Json
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          meta?: Json
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          meta?: Json
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_university_leaderboard: {
        Row: {
          full_name: string | null
          gender: string | null
          id: string | null
          level: number | null
          monthly_xp: number | null
          total_xp: number | null
          university_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_university: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "amir" | "committee" | "student" | "guest"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "amir", "committee", "student", "guest"],
    },
  },
} as const
