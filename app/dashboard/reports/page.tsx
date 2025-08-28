'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { tr } from 'date-fns/locale'
import { FileDown, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [startDate, endDate])

  const fetchTransactions = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('transactions')
      .select('*, categories(name, color)')
      .eq('user_id', user.id)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: true })

    if (data) {
      setTransactions(data)
    }
    setLoading(false)
  }

  const setPresetDateRange = (preset: string) => {
    const today = new Date()
    
    switch (preset) {
      case 'thisMonth':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'))
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'))
        break
      case 'lastMonth':
        const lastMonth = subMonths(today, 1)
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'))
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'))
        break
      case 'last3Months':
        setStartDate(format(subMonths(today, 3), 'yyyy-MM-dd'))
        setEndDate(format(today, 'yyyy-MM-dd'))
        break
      case 'last6Months':
        setStartDate(format(subMonths(today, 6), 'yyyy-MM-dd'))
        setEndDate(format(today, 'yyyy-MM-dd'))
        break
    }
  }

  // Verileri hesapla
  const calculateStats = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      income,
      expense,
      balance: income - expense,
      transactionCount: transactions.length
    }
  }

  // Kategori bazlı veri
  const getCategoryData = () => {
    const categoryMap = new Map()
    
    transactions.forEach(transaction => {
      if (transaction.categories) {
        const key = `${transaction.categories.name}-${transaction.type}`
        const existing = categoryMap.get(key) || {
          name: transaction.categories.name,
          type: transaction.type,
          amount: 0,
          color: transaction.categories.color
        }
        existing.amount += Number(transaction.amount)
        categoryMap.set(key, existing)
      }
    })

    return Array.from(categoryMap.values())
  }

  // Günlük veri
  const getDailyData = () => {
    const dailyMap = new Map()
    
    transactions.forEach(transaction => {
      const date = transaction.transaction_date
      const existing = dailyMap.get(date) || {
        date,
        income: 0,
        expense: 0
      }
      
      if (transaction.type === 'income') {
        existing.income += Number(transaction.amount)
      } else {
        existing.expense += Number(transaction.amount)
      }
      
      dailyMap.set(date, existing)
    })

    return Array.from(dailyMap.values()).map(d => ({
      ...d,
      date: format(new Date(d.date), 'dd MMM', { locale: tr })
    }))
  }

  const exportToCSV = () => {
    const headers = ['Tarih', 'Tip', 'Kategori', 'Açıklama', 'Tutar']
    const rows = transactions.map(t => [
      t.transaction_date,
      t.type === 'income' ? 'Gelir' : 'Gider',
      t.categories?.name || '-',
      t.description || '-',
      t.amount
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapor_${startDate}_${endDate}.csv`
    link.click()
  }

  const stats = calculateStats()
  const categoryData = getCategoryData()
  const dailyData = getDailyData()
  
  const incomeCategories = categoryData.filter(c => c.type === 'income')
  const expenseCategories = categoryData.filter(c => c.type === 'expense')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileDown className="h-5 w-5 mr-2" />
          CSV İndir
        </button>
      </div>

      {/* Tarih Filtresi */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hızlı Seçim
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPresetDateRange('thisMonth')}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Bu Ay
              </button>
              <button
                onClick={() => setPresetDateRange('lastMonth')}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Geçen Ay
              </button>
              <button
                onClick={() => setPresetDateRange('last3Months')}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Son 3 Ay
              </button>
              <button
                onClick={() => setPresetDateRange('last6Months')}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Son 6 Ay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600">
                ₺{stats.income.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-600">
                ₺{stats.expense.toFixed(2)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Bakiye</p>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ₺{stats.balance.toFixed(2)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">İşlem Sayısı</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.transactionCount}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Günlük Akış Grafiği */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Günlük Akış</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" name="Gelir" stroke="#10b981" />
              <Line type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gelir Kategorileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gelir Kategorileri</h3>
          {incomeCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategories}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {incomeCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Veri yok
            </div>
          )}
        </div>

        {/* Gider Kategorileri */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gider Kategorileri</h3>
          {expenseCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Veri yok
            </div>
          )}
        </div>

        {/* Karşılaştırma Grafiği */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Gelir-Gider Karşılaştırması</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: 'Özet', income: stats.income, expense: stats.expense }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" name="Gelir" fill="#10b981" />
              <Bar dataKey="expense" name="Gider" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}