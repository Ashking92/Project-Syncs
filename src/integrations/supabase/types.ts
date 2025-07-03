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
      admin_managed_students: {
        Row: {
          created_at: string
          created_by: string | null
          department: string
          email: string
          id: string
          name: string
          phone_number: string | null
          roll_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department: string
          email: string
          id?: string
          name: string
          phone_number?: string | null
          roll_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string
          email?: string
          id?: string
          name?: string
          phone_number?: string | null
          roll_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_read: boolean
          message: string
          target_roll_number: string | null
          target_type: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          is_read?: boolean
          message: string
          target_roll_number?: string | null
          target_type?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_read?: boolean
          message?: string
          target_roll_number?: string | null
          target_type?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          device_id: string | null
          email: string | null
          id: string
          ip_address: string | null
          name: string | null
          phone_number: string | null
          photo_url: string | null
          roll_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          name?: string | null
          phone_number?: string | null
          photo_url?: string | null
          roll_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          name?: string | null
          phone_number?: string | null
          photo_url?: string | null
          roll_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          estimated_cost: string
          hardware_requirements: string | null
          id: string
          project_description: string | null
          project_title: string
          remarks: string | null
          roll_number: string
          software_requirements: string | null
          status: string
          student_id: string | null
          student_name: string
          submitted_at: string
          team_members: string
          team_members_count: number
          technologies: string
        }
        Insert: {
          estimated_cost: string
          hardware_requirements?: string | null
          id?: string
          project_description?: string | null
          project_title: string
          remarks?: string | null
          roll_number: string
          software_requirements?: string | null
          status?: string
          student_id?: string | null
          student_name: string
          submitted_at?: string
          team_members: string
          team_members_count: number
          technologies: string
        }
        Update: {
          estimated_cost?: string
          hardware_requirements?: string | null
          id?: string
          project_description?: string | null
          project_title?: string
          remarks?: string | null
          roll_number?: string
          software_requirements?: string | null
          status?: string
          student_id?: string | null
          student_name?: string
          submitted_at?: string
          team_members?: string
          team_members_count?: number
          technologies?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
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
