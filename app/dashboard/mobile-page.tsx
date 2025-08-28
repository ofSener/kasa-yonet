'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { MobileCard } from '@/components/mobile/MobileCard'
import Link from 'next/link'

interface DashboardData {
  totalIncome: number
  totalExpense: number
  balance: number
  todayIncome: number
  todayExpense: number
  recentTransactions: any[]
}

export default function MobileDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    todayIncome: 0,
    todayExpense: 0,
    recentTransactions: []
  })
  const [loading, setLoading] = useState(true)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const selectedCompanyId = localStorage.getItem('selectedCompanyId')
      if (!selectedCompanyId) return

      const today = new Date().toISOString().split('T')[0]
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .eq('company_id', selectedCompanyId)
        .order('transaction_date', { ascending: false })

      if (transactions) {
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const todayTransactions = transactions.filter(t => 
          t.transaction_date === today
        )

        const todayIncome = todayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const todayExpense = todayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        setData({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          todayIncome,
          todayExpense,
          recentTransactions: transactions.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Dashboard verisi yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">
          <div className="text-gray-400">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance Hero Card */}
      <MobileCard className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm opacity-90">Toplam Bakiye</span>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              {balanceVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="text-3xl font-bold">
            {balanceVisible ? `₺${data.balance.toFixed(2)}` : '₺***'}
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm opacity-90">
            <div className="flex items-center space-x-1">
              <ArrowUpRight className="h-4 w-4" />
              <span>₺{data.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowDownRight className="h-4 w-4" />
              <span>₺{data.totalExpense.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </MobileCard>

      {/* Today's Summary */}
      <div className="grid grid-cols-2 gap-4">
        <MobileCard>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bugün Gelir</p>
              <p className="text-lg font-bold text-green-600">₺{data.todayIncome.toFixed(2)}</p>
            </div>
          </div>
        </MobileCard>

        <MobileCard>
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bugün Gider</p>
              <p className="text-lg font-bold text-red-600">₺{data.todayExpense.toFixed(2)}</p>
            </div>
          </div>
        </MobileCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/transactions/new?type=income">
          <MobileCard hoverable className="text-center">
            <div className="space-y-2">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Gelir Ekle</p>
            </div>
          </MobileCard>
        </Link>

        <Link href="/dashboard/transactions/new?type=expense">
          <MobileCard hoverable className="text-center">
            <div className="space-y-2">
              <div className="bg-red-100 p-3 rounded-full w-fit mx-auto">
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
              <p className="font-medium text-gray-900">Gider Ekle</p>
            </div>
          </MobileCard>
        </Link>
      </div>

      {/* Recent Transactions */}
      <MobileCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Son İşlemler</h3>
            <Link 
              href="/dashboard/transactions"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Tümünü Gör
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentTransactions.length > 0 ? (
              data.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description || 'İşlem'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.transaction_date), 'dd MMM', { locale: tr })}
                        </p>
                        {transaction.categories && (
                          <span 
                            className="px-2 py-0.5 text-xs rounded-full"
                            style={{
                              backgroundColor: `${transaction.categories.color}20`,
                              color: transaction.categories.color
                            }}
                          >
                            {transaction.categories.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₺{Number(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Henüz işlem bulunmuyor</p>
              </div>
            )}
          </div>
        </div>
      </MobileCard>
    </div>
  )
}