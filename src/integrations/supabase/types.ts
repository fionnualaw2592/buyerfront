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
      snapshot_leads: {
        Row: {
          company: string
          competitor: string | null
          created_at: string
          email: string
          id: string
          name: string
          notified: boolean
          notify_error: string | null
          sells: string
          user_agent: string | null
          website: string
        }
        Insert: {
          company: string
          competitor?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notified?: boolean
          notify_error?: string | null
          sells: string
          user_agent?: string | null
          website: string
        }
        Update: {
          company?: string
          competitor?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notified?: boolean
          notify_error?: string | null
          sells?: string
          user_agent?: string | null
          website?: string
        }
        Relationships: []
      }
      social_content: {
        Row: {
          asset_url: string | null
          buffer_channel_id: string
          buffer_post_id: string | null
          caption: string
          clicks: number | null
          comments: number | null
          content_number: string
          content_type: Database["public"]["Enums"]["social_content_type"]
          created_at: string
          hook: string
          id: string
          impressions: number | null
          last_error: string | null
          likes: number | null
          paid_conversions_attributed: number
          platform: Database["public"]["Enums"]["social_platform"]
          published_at: string | null
          reference: string | null
          revenue_attributed: number
          scheduled_for: string | null
          shares: number | null
          snapshot_leads_attributed: number
          status: Database["public"]["Enums"]["social_status"]
          tiktok_publish_mode:
            | Database["public"]["Enums"]["tiktok_publish_mode"]
            | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          asset_url?: string | null
          buffer_channel_id: string
          buffer_post_id?: string | null
          caption?: string
          clicks?: number | null
          comments?: number | null
          content_number: string
          content_type?: Database["public"]["Enums"]["social_content_type"]
          created_at?: string
          hook?: string
          id?: string
          impressions?: number | null
          last_error?: string | null
          likes?: number | null
          paid_conversions_attributed?: number
          platform: Database["public"]["Enums"]["social_platform"]
          published_at?: string | null
          reference?: string | null
          revenue_attributed?: number
          scheduled_for?: string | null
          shares?: number | null
          snapshot_leads_attributed?: number
          status?: Database["public"]["Enums"]["social_status"]
          tiktok_publish_mode?:
            | Database["public"]["Enums"]["tiktok_publish_mode"]
            | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          asset_url?: string | null
          buffer_channel_id?: string
          buffer_post_id?: string | null
          caption?: string
          clicks?: number | null
          comments?: number | null
          content_number?: string
          content_type?: Database["public"]["Enums"]["social_content_type"]
          created_at?: string
          hook?: string
          id?: string
          impressions?: number | null
          last_error?: string | null
          likes?: number | null
          paid_conversions_attributed?: number
          platform?: Database["public"]["Enums"]["social_platform"]
          published_at?: string | null
          reference?: string | null
          revenue_attributed?: number
          scheduled_for?: string | null
          shares?: number | null
          snapshot_leads_attributed?: number
          status?: Database["public"]["Enums"]["social_status"]
          tiktok_publish_mode?:
            | Database["public"]["Enums"]["tiktok_publish_mode"]
            | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      social_content_type:
        | "experiment"
        | "market_evidence"
        | "ai_discovery_test"
        | "prospect_signal"
      social_platform: "linkedin" | "tiktok"
      social_status:
        | "draft"
        | "approved"
        | "scheduled"
        | "published"
        | "failed"
        | "cancelled"
      tiktok_publish_mode: "direct_publish" | "notification_publish"
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
      social_content_type: [
        "experiment",
        "market_evidence",
        "ai_discovery_test",
        "prospect_signal",
      ],
      social_platform: ["linkedin", "tiktok"],
      social_status: [
        "draft",
        "approved",
        "scheduled",
        "published",
        "failed",
        "cancelled",
      ],
      tiktok_publish_mode: ["direct_publish", "notification_publish"],
    },
  },
} as const
