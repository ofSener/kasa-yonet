export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          owner_id: string
          invite_code: string | null
          invite_code_expires_at: string | null
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          invite_code?: string | null
          invite_code_expires_at?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          invite_code?: string | null
          invite_code_expires_at?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'user'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'user'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'user'
          invited_by?: string | null
          joined_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          color: string
          icon: string | null
          user_id: string
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          color?: string
          icon?: string | null
          user_id: string
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string
          icon?: string | null
          user_id?: string
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          type: 'income' | 'expense'
          description: string | null
          category_id: string | null
          user_id: string
          company_id: string | null
          created_by: string | null
          transaction_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          type: 'income' | 'expense'
          description?: string | null
          category_id?: string | null
          user_id: string
          company_id?: string | null
          created_by?: string | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          type?: 'income' | 'expense'
          description?: string | null
          category_id?: string | null
          user_id?: string
          company_id?: string | null
          created_by?: string | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
        }
      }
    }
  }
}