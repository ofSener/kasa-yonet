'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Copy, RefreshCw, Shield, User as UserIcon, Trash2, Clock } from 'lucide-react'

interface TeamMember {
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'user'
  joined_at: string
  user: {
    email: string
    full_name: string | null
  }
}

interface Company {
  id: string
  name: string
  invite_code: string | null
  invite_code_expires_at: string | null
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshingCode, setRefreshingCode] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')
  
  const supabase = createClient()

  useEffect(() => {
    fetchTeamData()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateTimeLeft = () => {
    if (!company?.invite_code_expires_at) return
    
    const expires = new Date(company.invite_code_expires_at)
    const now = new Date()
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) {
      setTimeLeft('Süresi doldu')
    } else {
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }
  }

  const fetchTeamData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Aktif şirketi localStorage'dan al
      const companyId = localStorage.getItem('selectedCompanyId')
      if (!companyId) return

      // Kullanıcının rolünü al
      const { data: currentMember } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .single()

      if (currentMember) {
        setUserRole(currentMember.role)
      }

      // Sadece admin ve owner görebilir
      if (currentMember?.role !== 'admin' && currentMember?.role !== 'owner') {
        return
      }

      // Şirket bilgilerini getir
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (companyData) {
        setCompany(companyData)
      }

      // Takım üyelerini getir - Function kullanarak
      const { data: membersData, error: membersError } = await supabase.rpc(
        'get_company_members_with_users',
        { company_uuid: companyId }
      )

      console.log('👥 DEBUG: Team members fetch result:', { membersData, membersError })

      if (membersError) {
        console.error('Team members fetch error:', membersError)
      } else if (membersData) {
        // Function'dan gelen veriyi beklenen formata dönüştür
        const formattedMembers = membersData.map((member: any) => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          user: {
            email: member.user_email,
            full_name: member.user_full_name
          }
        }))
        console.log('👥 DEBUG: Formatted members:', formattedMembers)
        setMembers(formattedMembers)
      }
    } catch (error) {
      console.error('Takım verileri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshInviteCode = async () => {
    if (!company) return
    
    setRefreshingCode(true)
    try {
      const { data, error } = await supabase.rpc('refresh_invite_code', {
        company_uuid: company.id
      })

      if (!error && data) {
        setCompany({
          ...company,
          invite_code: data,
          invite_code_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
      }
    } catch (error) {
      console.error('Kod yenilenirken hata:', error)
    } finally {
      setRefreshingCode(false)
    }
  }

  const copyInviteCode = () => {
    if (company?.invite_code) {
      navigator.clipboard.writeText(company.invite_code)
      alert('Davet kodu kopyalandı!')
    }
  }

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'user') => {
    const { error } = await supabase
      .from('company_members')
      .update({ role: newRole })
      .eq('id', memberId)

    if (!error) {
      fetchTeamData()
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Bu kullanıcıyı çıkarmak istediğinizden emin misiniz?')) return

    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('id', memberId)

    if (!error) {
      fetchTeamData()
    }
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      owner: { text: 'Sahip', color: 'bg-purple-100 text-purple-800' },
      admin: { text: 'Yönetici', color: 'bg-blue-100 text-blue-800' },
      user: { text: 'Kullanıcı', color: 'bg-gray-100 text-gray-800' }
    }
    const badge = badges[role as keyof typeof badges]
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (userRole !== 'admin' && userRole !== 'owner') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Bu sayfayı görme yetkiniz yok</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Takım Yönetimi</h1>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span className="text-gray-600">{members.length} Üye</span>
        </div>
      </div>

      {/* Davet Kodu Kartı */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni Çalışan Davet Et</h2>
        
        {company?.invite_code ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Davet Kodu</p>
                <p className="text-3xl font-mono font-bold text-indigo-600 tracking-widest">
                  {company.invite_code}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyInviteCode}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Kopyala"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  onClick={refreshInviteCode}
                  disabled={refreshingCode}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Yeni Kod Oluştur"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshingCode ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Kalan süre: {timeLeft || 'Hesaplanıyor...'}</span>
            </div>

            <p className="text-sm text-gray-500">
              Bu kodu yeni çalışanlarınızla paylaşın. Kod 30 dakika geçerlidir.
            </p>
          </div>
        ) : (
          <button
            onClick={refreshInviteCode}
            disabled={refreshingCode}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {refreshingCode ? 'Oluşturuluyor...' : 'İlk Davet Kodunu Oluştur'}
          </button>
        )}
      </div>

      {/* Takım Üyeleri Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Takım Üyeleri</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Katılma Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 rounded-full p-2 mr-3">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.user?.full_name || 'İsimsiz'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joined_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {member.role !== 'owner' && userRole === 'owner' && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.id, e.target.value as 'admin' | 'user')}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="user">Kullanıcı</option>
                          <option value="admin">Yönetici</option>
                        </select>
                        <button
                          onClick={() => removeMember(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {member.role === 'owner' && (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bilgi Notu */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Roller:</strong><br />
          • <strong>Sahip:</strong> Tam yetki, şirketi yönetir<br />
          • <strong>Yönetici:</strong> Çalışan ekleyebilir, tüm işlemleri görebilir<br />
          • <strong>Kullanıcı:</strong> İşlem ekler, raporları görür
        </p>
      </div>
    </div>
  )
}