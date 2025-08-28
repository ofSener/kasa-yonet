'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDevice } from '@/hooks/useDevice'
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
  ChevronDown,
  Home,
  Plus,
  Bell,
  Search
} from 'lucide-react'

interface Company {
  id: string
  name: string
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { isMobile } = useDevice()
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

    try {
      // Kullanıcının şirketlerini getir - İki aşamalı sorgu ile daha güvenilir
      const { data: memberships, error: memberError } = await supabase
        .from('company_members')
        .select('company_id, role')
        .eq('user_id', user.id)

      // RLS hatası olsa bile, veri yoksa değil de gerçek hata varsa setup'a gönder
      if (memberError && memberError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Membership fetch error:', memberError)
        // Sadece kritik hatalarda setup'a yönlendir
        if (memberError.code === '42501' || memberError.message.includes('permission')) {
          router.push('/company/setup')
          return
        }
      }

      if (memberships && memberships.length > 0) {
        // Şirket bilgilerini ayrıca al
        const companyIds = memberships.map((m: any) => m.company_id)
        
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds)

        if (companiesError && companiesError.code !== 'PGRST116') {
          console.error('Companies fetch error:', companiesError)
          // Sadece kritik hatalarda setup'a yönlendir
          if (companiesError.code === '42501' || companiesError.message.includes('permission')) {
            router.push('/company/setup')
            return
          }
        }

        if (companiesData && companiesData.length > 0) {
          setCompanies(companiesData)

          // LocalStorage'dan son seçilen şirketi al
          const savedCompanyId = localStorage.getItem('selectedCompanyId')
          const savedCompany = companiesData.find((c: any) => c.id === savedCompanyId)
          
          if (savedCompany) {
            handleSetCurrentCompany(savedCompany)
          } else {
            handleSetCurrentCompany(companiesData[0])
          }
        } else {
          router.push('/company/setup')
        }
      } else {
        router.push('/company/setup')
      }
    } catch (error) {
      console.error('Fetch companies error:', error)
      router.push('/company/setup')
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
        setUserRole((member as any).role)
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

  // Mobile navigation items
  const mobileNavItems = [
    { href: '/dashboard', label: 'Ana Sayfa', icon: Home },
    { href: '/dashboard/transactions', label: 'İşlemler', icon: List },
    { href: '/dashboard/transactions/new', label: 'Ekle', icon: Plus, isSpecial: true },
    { href: '/dashboard/reports', label: 'Raporlar', icon: TrendingUp },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
  ]

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Mobile Header */}
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
            
            {/* Mobile Company Selector */}
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

        {/* Mobile Main Content */}
        <main className="flex-1 pb-20 overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-5 h-16">
            {mobileNavItems.map((item) => {
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

        {/* Mobile Quick Action Menu */}
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

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
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

        {/* Desktop Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}