'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  Plus,
  List,
  TrendingUp,
  User,
  LogOut,
  Building,
  ChevronDown,
  Settings,
  Users,
  Bell,
  Search
} from 'lucide-react'

interface Company {
  id: string
  name: string
}

export default function MobileDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  useEffect(() => {
    fetchUserCompanies()
  }, [])

  const fetchUserCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: memberships } = await supabase
      .from('company_members')
      .select('*, companies(*)')
      .eq('user_id', user.id)

    if (memberships && memberships.length > 0) {
      const companiesList = memberships.map(m => m.companies).filter(Boolean) as Company[]
      setCompanies(companiesList)

      const savedCompanyId = localStorage.getItem('selectedCompanyId')
      const savedCompany = companiesList.find(c => c.id === savedCompanyId)
      
      if (savedCompany) {
        handleSetCurrentCompany(savedCompany)
      } else if (companiesList.length > 0) {
        handleSetCurrentCompany(companiesList[0])
      }
    } else {
      router.push('/company/setup')
    }
  }

  const handleSetCurrentCompany = async (company: Company) => {
    setCurrentCompany(company)
    localStorage.setItem('selectedCompanyId', company.id)
    setShowCompanyDropdown(false)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: member } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', company.id)
        .eq('user_id', user.id)
        .single()

      if (member) {
        setUserRole(member.role)
      }
    }

    router.refresh()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const bottomNavItems = [
    { href: '/dashboard', label: 'Ana Sayfa', icon: Home },
    { href: '/dashboard/transactions', label: 'İşlemler', icon: List },
    { href: '/dashboard/transactions/new', label: 'Ekle', icon: Plus, isSpecial: true },
    { href: '/dashboard/reports', label: 'Raporlar', icon: TrendingUp },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header - Mobile Optimized */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-indigo-600">Kasa Takip</h1>
              <div className="relative">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          
          {/* Company Selector - Mobile */}
          {currentCompany && (
            <div className="relative">
              <button
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-indigo-500" />
                  <span className="text-gray-900 font-medium truncate">{currentCompany.name}</span>
                  {userRole && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                      {userRole === 'owner' ? 'Sahip' : userRole === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
              </button>

              {showCompanyDropdown && companies.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  {companies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => handleSetCurrentCompany(company)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl ${
                        company.id === currentCompany.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      {company.name}
                    </button>
                  ))}
                  <Link
                    href="/company/setup"
                    className="w-full block px-4 py-3 text-sm text-indigo-600 hover:bg-gray-50 border-t border-gray-200 rounded-b-xl"
                  >
                    + Yeni Şirket Ekle
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quick Search */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="İşlem ara..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center relative"
                >
                  <div className="absolute -top-3 bg-indigo-600 p-3 rounded-full shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-400 mt-4">{item.label}</span>
                </Link>
              )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center transition-colors ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : ''}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Quick Action Menu */}
      {userRole === 'admin' || userRole === 'owner' ? (
        <div className="fixed bottom-20 right-4 z-40">
          <div className="flex flex-col space-y-2">
            <Link
              href="/dashboard/categories"
              className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Link>
            <Link
              href="/dashboard/team"
              className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <Users className="h-5 w-5 text-gray-600" />
            </Link>
          </div>
        </div>
      ) : null}

      {/* Overlay for dropdowns */}
      {showCompanyDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowCompanyDropdown(false)}
        />
      )}
    </div>
  )
}