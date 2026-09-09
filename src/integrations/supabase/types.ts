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
      diagnostic_competitors: {
        Row: {
          aliases: string[]
          competitor_name: string
          competitor_website: string | null
          created_at: string
          diagnostic_id: string
          id: string
        }
        Insert: {
          aliases?: string[]
          competitor_name: string
          competitor_website?: string | null
          created_at?: string
          diagnostic_id: string
          id?: string
        }
        Update: {
          aliases?: string[]
          competitor_name?: string
          competitor_website?: string | null
          created_at?: string
          diagnostic_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_competitors_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_findings: {
        Row: {
          created_at: string
          diagnostic_id: string
          finding: string
          finding_type: Database["public"]["Enums"]["diagnostic_finding_type"]
          id: string
          run_ids: string[]
          supporting_evidence: string | null
        }
        Insert: {
          created_at?: string
          diagnostic_id: string
          finding: string
          finding_type: Database["public"]["Enums"]["diagnostic_finding_type"]
          id?: string
          run_ids?: string[]
          supporting_evidence?: string | null
        }
        Update: {
          created_at?: string
          diagnostic_id?: string
          finding?: string
          finding_type?: Database["public"]["Enums"]["diagnostic_finding_type"]
          id?: string
          run_ids?: string[]
          supporting_evidence?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_findings_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_mentions: {
        Row: {
          brand_name: string
          canonical_brand_name: string
          character_offset: number | null
          created_at: string
          id: string
          is_competitor: boolean
          is_first_mentioned: boolean
          is_target_brand: boolean
          is_top_3: boolean
          mention_position: number
          recommendation_context: string | null
          run_id: string
        }
        Insert: {
          brand_name: string
          canonical_brand_name: string
          character_offset?: number | null
          created_at?: string
          id?: string
          is_competitor?: boolean
          is_first_mentioned?: boolean
          is_target_brand?: boolean
          is_top_3?: boolean
          mention_position: number
          recommendation_context?: string | null
          run_id: string
        }
        Update: {
          brand_name?: string
          canonical_brand_name?: string
          character_offset?: number | null
          created_at?: string
          id?: string
          is_competitor?: boolean
          is_first_mentioned?: boolean
          is_target_brand?: boolean
          is_top_3?: boolean
          mention_position?: number
          recommendation_context?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_mentions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_monitoring_comparisons: {
        Row: {
          baseline_diagnostic_id: string
          comparison_diagnostic_id: string
          comparison_metadata: Json
          comparison_results: Json
          created_at: string
          id: string
        }
        Insert: {
          baseline_diagnostic_id: string
          comparison_diagnostic_id: string
          comparison_metadata?: Json
          comparison_results?: Json
          created_at?: string
          id?: string
        }
        Update: {
          baseline_diagnostic_id?: string
          comparison_diagnostic_id?: string
          comparison_metadata?: Json
          comparison_results?: Json
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_monitoring_comparisons_baseline_diagnostic_id_fkey"
            columns: ["baseline_diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_monitoring_comparisons_comparison_diagnostic_id_fkey"
            columns: ["comparison_diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_prompts: {
        Row: {
          created_at: string
          diagnostic_id: string
          enabled: boolean
          id: string
          intent_type: string
          prompt_number: number
          prompt_text: string
        }
        Insert: {
          created_at?: string
          diagnostic_id: string
          enabled?: boolean
          id?: string
          intent_type?: string
          prompt_number: number
          prompt_text: string
        }
        Update: {
          created_at?: string
          diagnostic_id?: string
          enabled?: boolean
          id?: string
          intent_type?: string
          prompt_number?: number
          prompt_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_prompts_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_runs: {
        Row: {
          actual_cost_usd: number | null
          citations_json: Json
          created_at: string
          diagnostic_id: string
          error_message: string | null
          estimated_cost_usd: number | null
          grounding_mode: string
          id: string
          input_tokens: number | null
          is_manual_import: boolean
          is_test_connection: boolean
          model_name: string
          model_version: string | null
          output_tokens: number | null
          prompt_id: string | null
          prompt_text: string
          provider: Database["public"]["Enums"]["diagnostic_provider"]
          raw_payload: Json | null
          raw_response: string | null
          run_status: Database["public"]["Enums"]["diagnostic_run_status"]
          run_timestamp: string
          search_calls: number | null
          source_urls_json: Json
        }
        Insert: {
          actual_cost_usd?: number | null
          citations_json?: Json
          created_at?: string
          diagnostic_id: string
          error_message?: string | null
          estimated_cost_usd?: number | null
          grounding_mode?: string
          id?: string
          input_tokens?: number | null
          is_manual_import?: boolean
          is_test_connection?: boolean
          model_name: string
          model_version?: string | null
          output_tokens?: number | null
          prompt_id?: string | null
          prompt_text?: string
          provider: Database["public"]["Enums"]["diagnostic_provider"]
          raw_payload?: Json | null
          raw_response?: string | null
          run_status?: Database["public"]["Enums"]["diagnostic_run_status"]
          run_timestamp?: string
          search_calls?: number | null
          source_urls_json?: Json
        }
        Update: {
          actual_cost_usd?: number | null
          citations_json?: Json
          created_at?: string
          diagnostic_id?: string
          error_message?: string | null
          estimated_cost_usd?: number | null
          grounding_mode?: string
          id?: string
          input_tokens?: number | null
          is_manual_import?: boolean
          is_test_connection?: boolean
          model_name?: string
          model_version?: string | null
          output_tokens?: number | null
          prompt_id?: string | null
          prompt_text?: string
          provider?: Database["public"]["Enums"]["diagnostic_provider"]
          raw_payload?: Json | null
          raw_response?: string | null
          run_status?: Database["public"]["Enums"]["diagnostic_run_status"]
          run_timestamp?: string
          search_calls?: number | null
          source_urls_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_runs_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_runs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_sources: {
        Row: {
          citation_position: number | null
          created_at: string
          diagnostic_id: string
          domain: string
          frequency: number
          id: string
          provider: Database["public"]["Enums"]["diagnostic_provider"]
          run_id: string | null
          source_url: string
        }
        Insert: {
          citation_position?: number | null
          created_at?: string
          diagnostic_id: string
          domain: string
          frequency?: number
          id?: string
          provider: Database["public"]["Enums"]["diagnostic_provider"]
          run_id?: string | null
          source_url: string
        }
        Update: {
          citation_position?: number | null
          created_at?: string
          diagnostic_id?: string
          domain?: string
          frequency?: number
          id?: string
          provider?: Database["public"]["Enums"]["diagnostic_provider"]
          run_id?: string | null
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_sources_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_sources_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          baseline_diagnostic_id: string | null
          company_name: string
          completed_at: string | null
          created_at: string
          diagnostic_number: string
          diagnostic_type: Database["public"]["Enums"]["diagnostic_type"]
          id: string
          market: string
          max_estimated_cost_usd: number
          max_provider_calls: number
          notes: string | null
          provider_config: Json
          started_at: string | null
          status: Database["public"]["Enums"]["diagnostic_status"]
          target_aliases: string[]
          updated_at: string
          website: string
        }
        Insert: {
          baseline_diagnostic_id?: string | null
          company_name: string
          completed_at?: string | null
          created_at?: string
          diagnostic_number: string
          diagnostic_type?: Database["public"]["Enums"]["diagnostic_type"]
          id?: string
          market?: string
          max_estimated_cost_usd?: number
          max_provider_calls?: number
          notes?: string | null
          provider_config?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          target_aliases?: string[]
          updated_at?: string
          website: string
        }
        Update: {
          baseline_diagnostic_id?: string | null
          company_name?: string
          completed_at?: string | null
          created_at?: string
          diagnostic_number?: string
          diagnostic_type?: Database["public"]["Enums"]["diagnostic_type"]
          id?: string
          market?: string
          max_estimated_cost_usd?: number
          max_provider_calls?: number
          notes?: string | null
          provider_config?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["diagnostic_status"]
          target_aliases?: string[]
          updated_at?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_baseline_diagnostic_id_fkey"
            columns: ["baseline_diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
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
      diagnostic_finding_type: "observed" | "inferred"
      diagnostic_provider: "openai" | "google" | "perplexity" | "manual"
      diagnostic_run_status: "success" | "failed" | "skipped"
      diagnostic_status:
        | "draft"
        | "ready"
        | "running"
        | "complete"
        | "partial"
        | "failed"
        | "archived"
      diagnostic_type: "mini_signal" | "snapshot" | "deep_dive" | "monitoring"
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
      diagnostic_finding_type: ["observed", "inferred"],
      diagnostic_provider: ["openai", "google", "perplexity", "manual"],
      diagnostic_run_status: ["success", "failed", "skipped"],
      diagnostic_status: [
        "draft",
        "ready",
        "running",
        "complete",
        "partial",
        "failed",
        "archived",
      ],
      diagnostic_type: ["mini_signal", "snapshot", "deep_dive", "monitoring"],
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
