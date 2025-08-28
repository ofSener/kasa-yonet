'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type Company = Database['public']['Tables']['companies']['Row']
type Member = Database['public']['Tables']['company_members']['Row']

interface CompanyContextType {
  currentCompany: Company | null
  userRole: 'owner' | 'admin' | 'user' | null
  companies: Company[]
  setCurrentCompany: (company: Company) => void
  refreshCompanies: () => Promise<void>
  loading: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCompanies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Kullanıcının üyesi olduğu şirketleri getir
      const { data: memberships } = await supabase
        .from('company_members')
        .select('*, companies(*)')
        .eq('user_id', user.id)

      if (memberships) {
        const companiesList = memberships.map(m => m.companies).filter(Boolean) as Company[]
        setCompanies(companiesList)

        // LocalStorage'dan son seçilen şirketi al veya ilkini seç
        const savedCompanyId = localStorage.getItem('selectedCompanyId')
        const savedCompany = companiesList.find(c => c.id === savedCompanyId)
        
        if (savedCompany) {
          handleSetCurrentCompany(savedCompany)
        } else if (companiesList.length > 0) {
          handleSetCurrentCompany(companiesList[0])
        }
      }
    } catch (error) {
      console.error('Şirketler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetCurrentCompany = async (company: Company) => {
    setCurrentCompany(company)
    localStorage.setItem('selectedCompanyId', company.id)
    
    // Kullanıcının rolünü al
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', company.id)
        .eq('user_id', user.id)
        .single()

      if (member) {
        setUserRole(member.role as 'owner' | 'admin' | 'user')
      }
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        userRole,
        companies,
        setCurrentCompany: handleSetCurrentCompany,
        refreshCompanies: fetchCompanies,
        loading
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}