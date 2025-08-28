'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  PlusCircle,
  List,
  TrendingUp,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  Users,
  Building,
  ChevronDown
} from 'lucide-react'

interface Company {
  id: string
  name: string
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

    // Kullanıcının şirketlerini getir
    const { data: memberships } = await supabase
      .from('company_members')
      .select('*, companies(*)')
      .eq('user_id', user.id)

    if (memberships) {
      const companiesList = memberships.map(m => m.companies).filter(Boolean) as Company[]
      setCompanies(companiesList)

      // LocalStorage'dan son seçilen şirketi al
      const savedCompanyId = localStorage.getItem('selectedCompanyId')
      const savedCompany = companiesList.find(c => c.id === savedCompanyId)
      
      if (savedCompany) {
        handleSetCurrentCompany(savedCompany)
      } else if (companiesList.length > 0) {
        handleSetCurrentCompany(companiesList[0])
      }
    }
  }

  const handleSetCurrentCompany = async (company: Company) => {
    setCurrentCompany(company)
    localStorage.setItem('selectedCompanyId', company.id)
    setShowCompanyDropdown(false)
    
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
        setUserRole(member.role)
      }
    }

    // Sayfayı yenile
    router.refresh()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    { href: '/dashboard', label: 'Özet', icon: LayoutDashboard },
    { href: '/dashboard/transactions/new', label: 'Yeni İşlem', icon: PlusCircle },
    { href: '/dashboard/transactions', label: 'İşlemler', icon: List },
    { href: '/dashboard/reports', label: 'Raporlar', icon: TrendingUp },
    { href: '/dashboard/categories', label: 'Kategoriler', icon: Settings },
  ]

  // Sadece admin ve owner takım sayfasını görebilir
  if (userRole === 'admin' || userRole === 'owner') {
    menuItems.push({ href: '/dashboard/team', label: 'Takım', icon: Users })
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Company Selector */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-indigo-600 mb-3">Kasa Takip</h1>
            
            {/* Şirket Seçici */}
            {currentCompany && (
              <div className="relative">
                <button
                  onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-900 font-medium">{currentCompany.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {showCompanyDropdown && companies.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {companies.map(company => (
                      <button
                        key={company.id}
                        onClick={() => handleSetCurrentCompany(company)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          company.id === currentCompany.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                        }`}
                      >
                        {company.name}
                      </button>
                    ))}
                    <Link
                      href="/company/setup"
                      className="w-full block px-3 py-2 text-sm text-indigo-600 hover:bg-gray-50 border-t border-gray-200"
                    >
                      + Yeni Şirket Ekle
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            {userRole && (
              <div className="mb-2 px-3 py-1">
                <span className="text-xs text-gray-500">Rol: </span>
                <span className="text-xs font-medium text-gray-700">
                  {userRole === 'owner' ? 'Sahip' : userRole === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-5 w-5 mr-2" />
                <span>Hoş geldiniz</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}