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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_category:
            | Database["public"]["Enums"]["parent_category_type"]
            | null
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_category?:
            | Database["public"]["Enums"]["parent_category_type"]
            | null
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_category?:
            | Database["public"]["Enums"]["parent_category_type"]
            | null
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiry: {
        Row: {
          email: string
          id: string
          message: string
          name: string
          status: Database["public"]["Enums"]["contact_inquiry_status"]
          subject: string
          submitted_at: string
        }
        Insert: {
          email: string
          id?: string
          message: string
          name: string
          status?: Database["public"]["Enums"]["contact_inquiry_status"]
          subject: string
          submitted_at?: string
        }
        Update: {
          email?: string
          id?: string
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["contact_inquiry_status"]
          subject?: string
          submitted_at?: string
        }
        Relationships: []
      }
      day_out_inquiry: {
        Row: {
          destination: string | null
          id: string
          mobile_no: string
          name: string
          number_of_people: number
          package_id: string
          preferred_date: string
          special_comments: string | null
          status: Database["public"]["Enums"]["day_out_inquiry_status"]
          submitted_at: string
        }
        Insert: {
          destination?: string | null
          id?: string
          mobile_no: string
          name: string
          number_of_people: number
          package_id: string
          preferred_date: string
          special_comments?: string | null
          status?: Database["public"]["Enums"]["day_out_inquiry_status"]
          submitted_at?: string
        }
        Update: {
          destination?: string | null
          id?: string
          mobile_no?: string
          name?: string
          number_of_people?: number
          package_id?: string
          preferred_date?: string
          special_comments?: string | null
          status?: Database["public"]["Enums"]["day_out_inquiry_status"]
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_out_inquiry_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_out_inquiry_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vw_published_tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_out_inquiry_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "vw_tour_by_slug"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_settings: {
        Row: {
          featured_tours: Json | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          testimonials: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          featured_tours?: Json | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          testimonials?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          featured_tours?: Json | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          testimonials?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          contact_number: string | null
          created_at: string
          date_of_travel: string | null
          email: string
          hotel_category: string | null
          id: string
          message: string
          name: string
          nationality: string | null
          number_of_kids: string | null
          number_of_people: string | null
          number_of_rooms: number | null
          status: Database["public"]["Enums"]["inquiry_status"] | null
          submitted_at: string | null
          tour_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          contact_number?: string | null
          created_at?: string
          date_of_travel?: string | null
          email: string
          hotel_category?: string | null
          id?: string
          message: string
          name: string
          nationality?: string | null
          number_of_kids?: string | null
          number_of_people?: string | null
          number_of_rooms?: number | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          submitted_at?: string | null
          tour_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          contact_number?: string | null
          created_at?: string
          date_of_travel?: string | null
          email?: string
          hotel_category?: string | null
          id?: string
          message?: string
          name?: string
          nationality?: string | null
          number_of_kids?: string | null
          number_of_people?: string | null
          number_of_rooms?: number | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          submitted_at?: string | null
          tour_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "vw_published_tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "vw_tour_by_slug"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_enquiries: {
        Row: {
          destination: string | null
          id: string
          mobile_no: string
          name: string
          number_of_people: number | null
          preferred_date: string | null
          special_comments: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          destination?: string | null
          id?: string
          mobile_no: string
          name: string
          number_of_people?: number | null
          preferred_date?: string | null
          special_comments?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          destination?: string | null
          id?: string
          mobile_no?: string
          name?: string
          number_of_people?: number | null
          preferred_date?: string | null
          special_comments?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_value: Json
          element_key: string
          id: string
          updated_at: string
        }
        Insert: {
          content_value: Json
          element_key: string
          id?: string
          updated_at?: string
        }
        Update: {
          content_value?: Json
          element_key?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tour_images: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          section: string | null
          tour_id: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          section?: string | null
          tour_id: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          section?: string | null
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_images_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_images_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "vw_published_tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_images_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "vw_tour_by_slug"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_sections: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          id: string
          is_visible: boolean | null
          order: number | null
          title: string | null
          tour_id: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean | null
          order?: number | null
          title?: string | null
          tour_id: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible?: boolean | null
          order?: number | null
          title?: string | null
          tour_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_sections_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_sections_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "vw_published_tours"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_sections_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "vw_tour_by_slug"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          display_order: number | null
          duration_days: number | null
          featured_image_url: string | null
          id: string
          image_gallery_urls: Json | null
          is_day_out_package: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          itinerary: Json | null
          location: string | null
          max_group_size: number | null
          meta_description: string | null
          meta_title: string | null
          overview: Json | null
          price: number | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["tour_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          duration_days?: number | null
          featured_image_url?: string | null
          id?: string
          image_gallery_urls?: Json | null
          is_day_out_package?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          itinerary?: Json | null
          location?: string | null
          max_group_size?: number | null
          meta_description?: string | null
          meta_title?: string | null
          overview?: Json | null
          price?: number | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["tour_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          display_order?: number | null
          duration_days?: number | null
          featured_image_url?: string | null
          id?: string
          image_gallery_urls?: Json | null
          is_day_out_package?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          itinerary?: Json | null
          location?: string | null
          max_group_size?: number | null
          meta_description?: string | null
          meta_title?: string | null
          overview?: Json | null
          price?: number | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["tour_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tours_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_published_tours: {
        Row: {
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          display_order: number | null
          duration_days: number | null
          featured_image_url: string | null
          id: string | null
          images: Json | null
          is_day_out_package: boolean | null
          is_featured: boolean | null
          location: string | null
          parent_category_name: string | null
          parent_category_slug: string | null
          price: number | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          slug: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tours_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_tour_by_slug: {
        Row: {
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          description: string | null
          display_order: number | null
          duration_days: number | null
          featured_image_url: string | null
          id: string | null
          images: Json | null
          is_day_out_package: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          itinerary: Json | null
          location: string | null
          overview_content: Json | null
          price: number | null
          rating: number | null
          review_count: number | null
          sections: Json | null
          short_description: string | null
          slug: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tours_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_tour_slug_available: {
        Args: { p_slug: string; p_tour_id?: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      contact_inquiry_status: "new" | "responded" | "archived"
      day_out_inquiry_status: "new" | "contacted" | "closed"
      inquiry_status: "new" | "in_progress" | "resolved" | "closed"
      parent_category_type:
        | "Kerala Travel"
        | "Discover India"
        | "Global Holiday"
        | "Kerala Travels"
      tour_status: "draft" | "published" | "archived"
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
      app_role: ["admin", "moderator", "user"],
      contact_inquiry_status: ["new", "responded", "archived"],
      day_out_inquiry_status: ["new", "contacted", "closed"],
      inquiry_status: ["new", "in_progress", "resolved", "closed"],
      parent_category_type: [
        "Kerala Travel",
        "Discover India",
        "Global Holiday",
        "Kerala Travels",
      ],
      tour_status: ["draft", "published", "archived"],
    },
  },
} as const
