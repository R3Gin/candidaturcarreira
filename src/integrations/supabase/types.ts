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
      activities: {
        Row: {
          created_at: string
          detail: string
          id: string
          kind: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string
          id?: string
          kind: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          kind?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      application_events: {
        Row: {
          application_id: string
          created_at: string
          created_by: string | null
          id: string
          label: string
          note: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          label: string
          note?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          candidate_id: string
          created_at: string
          feedback: string
          id: string
          letter: string
          next_step: string
          qualifications: string[]
          stage: number
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          vacancy_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          feedback?: string
          id?: string
          letter?: string
          next_step?: string
          qualifications?: string[]
          stage?: number
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          vacancy_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          feedback?: string
          id?: string
          letter?: string
          next_step?: string
          qualifications?: string[]
          stage?: number
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          about: string
          city: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          segment: string
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          about?: string
          city?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          segment?: string
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          about?: string
          city?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          segment?: string
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["company_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      followed_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          reason?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followed_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_preferences: {
        Row: {
          availability: string
          city: string
          contracts: string[]
          created_at: string
          min_salary: string
          models: string[]
          notify_email: boolean
          notify_whats: boolean
          role: string
          seniority: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string
          city?: string
          contracts?: string[]
          created_at?: string
          min_salary?: string
          models?: string[]
          notify_email?: boolean
          notify_whats?: boolean
          role?: string
          seniority?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string
          city?: string
          contracts?: string[]
          created_at?: string
          min_salary?: string
          models?: string[]
          notify_email?: boolean
          notify_whats?: boolean
          role?: string
          seniority?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          email: string
          id: string
          name: string
          occupation: string | null
          onboarded_at: string | null
          phone: string
          photo_url: string | null
          terms_accepted_at: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          email?: string
          id: string
          name?: string
          occupation?: string | null
          onboarded_at?: string | null
          phone?: string
          photo_url?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          email?: string
          id?: string
          name?: string
          occupation?: string | null
          onboarded_at?: string | null
          phone?: string
          photo_url?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          education: string[]
          experiences: Json
          headline: string
          skills: string[]
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          education?: string[]
          experiences?: Json
          headline?: string
          skills?: string[]
          summary?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          education?: string[]
          experiences?: Json
          headline?: string
          skills?: string[]
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_vacancies: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vacancy_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vacancy_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_vacancies_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancies: {
        Row: {
          about: string
          benefits: string[]
          city: string
          company_id: string
          contact_email: string | null
          contract: string
          created_at: string
          created_by: string | null
          daily_rate: number | null
          id: string
          published_at: string | null
          qualifications: string[]
          quick_apply: boolean
          requirements: string[]
          responsibilities: string[]
          salary_max: number | null
          salary_min: number | null
          salary_text: string
          segment: string
          seniority: string
          shift_hours: string | null
          status: Database["public"]["Enums"]["vacancy_status"]
          tags: string[]
          title: string
          type: Database["public"]["Enums"]["vacancy_type"]
          updated_at: string
          work_date: string | null
          work_model: string
        }
        Insert: {
          about?: string
          benefits?: string[]
          city?: string
          company_id: string
          contact_email?: string | null
          contract?: string
          created_at?: string
          created_by?: string | null
          daily_rate?: number | null
          id?: string
          published_at?: string | null
          qualifications?: string[]
          quick_apply?: boolean
          requirements?: string[]
          responsibilities?: string[]
          salary_max?: number | null
          salary_min?: number | null
          salary_text?: string
          segment?: string
          seniority?: string
          shift_hours?: string | null
          status?: Database["public"]["Enums"]["vacancy_status"]
          tags?: string[]
          title: string
          type?: Database["public"]["Enums"]["vacancy_type"]
          updated_at?: string
          work_date?: string | null
          work_model?: string
        }
        Update: {
          about?: string
          benefits?: string[]
          city?: string
          company_id?: string
          contact_email?: string | null
          contract?: string
          created_at?: string
          created_by?: string | null
          daily_rate?: number | null
          id?: string
          published_at?: string | null
          qualifications?: string[]
          quick_apply?: boolean
          requirements?: string[]
          responsibilities?: string[]
          salary_max?: number | null
          salary_min?: number | null
          salary_text?: string
          segment?: string
          seniority?: string
          shift_hours?: string | null
          status?: Database["public"]["Enums"]["vacancy_status"]
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["vacancy_type"]
          updated_at?: string
          work_date?: string | null
          work_model?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_company_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "candidato" | "empresa" | "freela"
      application_status: "ativa" | "reprovada" | "contratada" | "desistiu"
      company_member_role: "admin" | "rh" | "recrutador"
      vacancy_status: "rascunho" | "publicada" | "encerrada"
      vacancy_type: "contratual" | "freelance"
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
      account_type: ["candidato", "empresa", "freela"],
      application_status: ["ativa", "reprovada", "contratada", "desistiu"],
      company_member_role: ["admin", "rh", "recrutador"],
      vacancy_status: ["rascunho", "publicada", "encerrada"],
      vacancy_type: ["contratual", "freelance"],
    },
  },
} as const
