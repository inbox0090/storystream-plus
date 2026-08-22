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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      episodes: {
        Row: {
          created_at: string
          description: string
          duration_minutes: number | null
          episode_number: number
          id: string
          name: string
          season: number
          still_url: string | null
          stream_url: string
          title_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration_minutes?: number | null
          episode_number: number
          id?: string
          name: string
          season?: number
          still_url?: string | null
          stream_url: string
          title_id: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_minutes?: number | null
          episode_number?: number
          id?: string
          name?: string
          season?: number
          still_url?: string | null
          stream_url?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_color: string
          created_at: string
          id: string
          is_kids: boolean
          name: string
          user_id: string
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          id?: string
          is_kids?: boolean
          name: string
          user_id: string
        }
        Update: {
          avatar_color?: string
          created_at?: string
          id?: string
          is_kids?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          currency: string
          features: string[]
          id: string
          max_quality: string
          max_screens: number
          name: string
          price_cents: number
          slug: string
          sort_order: number
        }
        Insert: {
          currency?: string
          features?: string[]
          id?: string
          max_quality: string
          max_screens?: number
          name: string
          price_cents: number
          slug: string
          sort_order?: number
        }
        Update: {
          currency?: string
          features?: string[]
          id?: string
          max_quality?: string
          max_screens?: number
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          id: string
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string
          id?: string
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          id?: string
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      title_categories: {
        Row: {
          category_id: string
          title_id: string
        }
        Insert: {
          category_id: string
          title_id: string
        }
        Update: {
          category_id?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_categories_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          backdrop_url: string | null
          cast_members: string[]
          created_at: string
          description: string
          duration_minutes: number | null
          genres: string[]
          id: string
          is_featured: boolean
          is_kids: boolean
          kind: string
          maturity_rating: string
          name: string
          poster_url: string
          release_year: number | null
          slug: string
          stream_url: string
          trailer_url: string | null
        }
        Insert: {
          backdrop_url?: string | null
          cast_members?: string[]
          created_at?: string
          description?: string
          duration_minutes?: number | null
          genres?: string[]
          id?: string
          is_featured?: boolean
          is_kids?: boolean
          kind?: string
          maturity_rating?: string
          name: string
          poster_url: string
          release_year?: number | null
          slug: string
          stream_url: string
          trailer_url?: string | null
        }
        Update: {
          backdrop_url?: string | null
          cast_members?: string[]
          created_at?: string
          description?: string
          duration_minutes?: number | null
          genres?: string[]
          id?: string
          is_featured?: boolean
          is_kids?: boolean
          kind?: string
          maturity_rating?: string
          name?: string
          poster_url?: string
          release_year?: number | null
          slug?: string
          stream_url?: string
          trailer_url?: string | null
        }
        Relationships: []
      }
      watch_progress: {
        Row: {
          duration_seconds: number | null
          episode_id: string | null
          id: string
          position_seconds: number
          profile_id: string
          title_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          duration_seconds?: number | null
          episode_id?: string | null
          id?: string
          position_seconds?: number
          profile_id: string
          title_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          duration_seconds?: number | null
          episode_id?: string | null
          id?: string
          position_seconds?: number
          profile_id?: string
          title_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_progress_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          title_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          title_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          title_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
