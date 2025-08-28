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

      // Kullanıcının üyesi olduğu şirketleri getir - İki aşamalı sorgu ile daha güvenilir
      const { data: memberships, error: memberError } = await supabase
        .from('company_members')
        .select('company_id, role')
        .eq('user_id', user.id)

      if (memberError) {
        console.error('Membership fetch error:', memberError)
        return
      }

      if (memberships && memberships.length > 0) {
        // Şirket bilgilerini ayrıca al
        const companyIds = memberships.map((m: any) => m.company_id)
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, owner_id')
          .in('id', companyIds)

        if (companiesError) {
          console.error('Companies fetch error:', companiesError)
          return
        }

        if (companiesData && companiesData.length > 0) {
          setCompanies(companiesData)

          // LocalStorage'dan son seçilen şirketi al veya ilkini seç
          const savedCompanyId = localStorage.getItem('selectedCompanyId')
          const savedCompany = companiesData.find((c: any) => c.id === savedCompanyId)
          
          if (savedCompany) {
            handleSetCurrentCompany(savedCompany)
          } else {
            handleSetCurrentCompany(companiesData[0])
          }
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
        setUserRole((member as any).role as 'owner' | 'admin' | 'user')
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