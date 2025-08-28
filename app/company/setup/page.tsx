'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building, Plus, Hash, Users } from 'lucide-react'

export default function CompanySetupPage() {
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [companyName, setCompanyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      setError('Şirket adı gereklidir')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      // Şirketi oluştur
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          owner_id: user.id
        })
        .select()
        .single()

      if (companyError) throw companyError

      // Sahibi member olarak ekle
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner'
        })

      if (memberError) throw memberError

      // Varsayılan kategorileri oluştur
      await supabase.rpc('create_company_default_categories', { 
        company_uuid: company.id 
      })

      // İlk davet kodunu oluştur
      await supabase.rpc('refresh_invite_code', { 
        company_uuid: company.id 
      })

      // Yeni şirketi localStorage'a kaydet ki dashboard'da doğru şirket seçilsin
      localStorage.setItem('selectedCompanyId', company.id)

      // Dashboard'a git ve sayfayı yenile
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Şirket oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCompany = async () => {
    if (inviteCode.length !== 6) {
      setError('Davet kodu 6 haneli olmalıdır')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      // Kodu kontrol et ve şirketi bul
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('invite_code', inviteCode)
        .gte('invite_code_expires_at', new Date().toISOString())
        .single()

      if (companyError || !company) {
        throw new Error('Geçersiz veya süresi dolmuş davet kodu')
      }

      // Zaten üye mi kontrol et - RLS nedeniyle hata verebilir, o yüzden try-catch ile sardım
      try {
        const { data: existingMember, error: memberCheckError } = await supabase
          .from('company_members')
          .select('id')
          .eq('company_id', company.id)
          .eq('user_id', user.id)
          .single()

        // RLS hatası değilse ve üyelik varsa
        if (existingMember && !memberCheckError) {
          throw new Error('Zaten bu şirketin üyesisiniz')
        }
      } catch (checkError: any) {
        // RLS hatası değilse ve duplicate üyelik hatası ise
        if (checkError.message && checkError.message.includes('Zaten bu şirketin üyesisiniz')) {
          throw checkError
        }
        // Diğer durumlar (RLS hatası gibi) için devam et
      }

      // Üye olarak ekle
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'user'
        })

      // Duplicate key hatası için özel mesaj
      if (memberError) {
        if (memberError.code === '23505' && memberError.message.includes('company_members_company_id_user_id_key')) {
          throw new Error('Zaten bu şirketin üyesisiniz')
        }
        throw memberError
      }

      // Katıldığımız şirketi localStorage'a kaydet
      localStorage.setItem('selectedCompanyId', company.id)

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Şirkete katılırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Şirket İşlemleri</h2>
          <p className="mt-2 text-gray-600">Yeni şirket oluşturun veya mevcut bir şirkete katılın</p>
        </div>

        {/* Tab Seçimi */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
              mode === 'create'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Şirket Oluştur
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
              mode === 'join'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Şirkete Katıl
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Şirket Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-600 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Örnek: ABC Şirketi"
                />
              </div>
            </div>

            <button
              onClick={handleCreateCompany}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Oluşturuluyor...' : 'Şirketi Oluştur'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                Davet Kodu (6 Haneli)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="inviteCode"
                  type="text"
                  maxLength={6}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, ''))}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-600 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Şirket yöneticisinden aldığınız 6 haneli kodu girin
              </p>
            </div>

            <button
              onClick={handleJoinCompany}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Katılınıyor...' : 'Şirkete Katıl'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}