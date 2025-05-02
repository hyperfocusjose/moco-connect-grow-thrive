export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          date: string
          description: string
          id: string
          reference_id: string
          related_user_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          id?: string
          reference_id: string
          related_user_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          reference_id?: string
          related_user_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          end_time: string
          id: string
          is_approved: boolean | null
          is_cancelled: boolean | null
          is_featured: boolean | null
          is_presentation_meeting: boolean | null
          location: string
          name: string
          presenter: string | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          end_time: string
          id?: string
          is_approved?: boolean | null
          is_cancelled?: boolean | null
          is_featured?: boolean | null
          is_presentation_meeting?: boolean | null
          location: string
          name: string
          presenter?: string | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          is_approved?: boolean | null
          is_cancelled?: boolean | null
          is_featured?: boolean | null
          is_presentation_meeting?: boolean | null
          location?: string
          name?: string
          presenter?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_tags: {
        Row: {
          id: string
          member_id: string | null
          tag: string
        }
        Insert: {
          id?: string
          member_id?: string | null
          tag: string
        }
        Update: {
          id?: string
          member_id?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_tags_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      one_to_ones: {
        Row: {
          created_at: string | null
          date: string
          id: string
          member1_id: string | null
          member1_name: string
          member2_id: string | null
          member2_name: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          member1_id?: string | null
          member1_name: string
          member2_id?: string | null
          member2_name: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          member1_id?: string | null
          member1_name?: string
          member2_id?: string | null
          member2_name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "one_to_ones_member1_id_fkey"
            columns: ["member1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "one_to_ones_member2_id_fkey"
            columns: ["member2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string | null
          text: string
        }
        Insert: {
          id?: string
          poll_id?: string | null
          text: string
        }
        Update: {
          id?: string
          poll_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string | null
          poll_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          poll_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string | null
          poll_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          start_date: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          business_name: string | null
          created_at: string | null
          email: string | null
          facebook: string | null
          first_name: string | null
          id: string
          industry: string | null
          instagram: string | null
          last_name: string | null
          linkedin: string | null
          phone_number: string | null
          profile_picture: string | null
          tiktok: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id: string
          industry?: string | null
          instagram?: string | null
          last_name?: string | null
          linkedin?: string | null
          phone_number?: string | null
          profile_picture?: string | null
          tiktok?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          first_name?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          last_name?: string | null
          linkedin?: string | null
          phone_number?: string | null
          profile_picture?: string | null
          tiktok?: string | null
          website?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          date: string
          description: string
          from_member_id: string | null
          from_member_name: string
          id: string
          to_member_id: string | null
          to_member_name: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          from_member_id?: string | null
          from_member_name: string
          id?: string
          to_member_id?: string | null
          to_member_name: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          from_member_id?: string | null
          from_member_name?: string
          id?: string
          to_member_id?: string | null
          to_member_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_to_member_id_fkey"
            columns: ["to_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tyfcb: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string
          from_member_id: string | null
          from_member_name: string
          id: string
          to_member_id: string | null
          to_member_name: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          description: string
          from_member_id?: string | null
          from_member_name: string
          id?: string
          to_member_id?: string | null
          to_member_name: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string
          from_member_id?: string | null
          from_member_name?: string
          id?: string
          to_member_id?: string | null
          to_member_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tyfcb_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tyfcb_to_member_id_fkey"
            columns: ["to_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          created_at: string | null
          did_not_show: boolean | null
          email: string | null
          host_member_id: string | null
          id: string
          industry: string | null
          is_self_entered: boolean | null
          phone_number: string | null
          visit_date: string
          visitor_business: string
          visitor_name: string
        }
        Insert: {
          created_at?: string | null
          did_not_show?: boolean | null
          email?: string | null
          host_member_id?: string | null
          id?: string
          industry?: string | null
          is_self_entered?: boolean | null
          phone_number?: string | null
          visit_date: string
          visitor_business: string
          visitor_name: string
        }
        Update: {
          created_at?: string | null
          did_not_show?: boolean | null
          email?: string | null
          host_member_id?: string | null
          id?: string
          industry?: string | null
          is_self_entered?: boolean | null
          phone_number?: string | null
          visit_date?: string
          visitor_business?: string
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitors_host_member_id_fkey"
            columns: ["host_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Extended type for admin-only vote visibility
export type PollOption = {
  id: string;
  text: string;
  votes: string[];
  voteDetails?: {
    userId: string;
    name: string;
    email: string;
  }[];
};