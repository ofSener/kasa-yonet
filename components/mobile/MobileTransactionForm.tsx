'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MobileInput } from './MobileInput'
import { MobileSelect } from './MobileSelect'
import { MobileButton } from './MobileButton'
import { MobileCard } from './MobileCard'
import { DollarSign, FileText, Calendar, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
}

export default function MobileTransactionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [type, setType] = useState<'income' | 'expense'>(
    (searchParams.get('type') as 'income' | 'expense') || 'expense'
  )
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [type])

  const fetchCategories = async () => {
    try {
      const selectedCompanyId = localStorage.getItem('selectedCompanyId')
      if (!selectedCompanyId) return

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .eq('type', type)
        .order('name')

      if (categoriesData) {
        setCategories(categoriesData)
        if (categoriesData.length > 0 && !categoryId) {
          setCategoryId(categoriesData[0].id)
        }
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

      const selectedCompanyId = localStorage.getItem('selectedCompanyId')
      if (!selectedCompanyId) throw new Error('Şirket seçilmedi')

      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            amount: parseFloat(amount),
            type,
            description: description.trim() || null,
            category_id: categoryId || null,
            transaction_date: transactionDate,
            company_id: selectedCompanyId,
            created_by: user.id
          }
        ])

      if (error) throw error

      router.push('/dashboard/transactions?success=true')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'İşlem eklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }))

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setType('expense')}
          className={`flex items-center justify-center space-x-2 py-4 px-4 rounded-xl border-2 transition-all ${
            type === 'expense'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <ArrowDownRight className="h-5 w-5" />
          <span className="font-medium">Gider</span>
        </button>
        <button
          onClick={() => setType('income')}
          className={`flex items-center justify-center space-x-2 py-4 px-4 rounded-xl border-2 transition-all ${
            type === 'income'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <ArrowUpRight className="h-5 w-5" />
          <span className="font-medium">Gelir</span>
        </button>
      </div>

      <MobileCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <MobileInput
            label="Tutar"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            icon={DollarSign}
            required
          />

          <MobileInput
            label="Açıklama"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={type === 'income' ? 'Gelir açıklaması...' : 'Gider açıklaması...'}
            icon={FileText}
          />

          {categories.length > 0 && (
            <MobileSelect
              label="Kategori"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
              icon={Tag}
            />
          )}

          <MobileInput
            label="Tarih"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            icon={Calendar}
            required
          />

          <div className="space-y-3">
            <MobileButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={type === 'income' ? ArrowUpRight : ArrowDownRight}
            >
              {type === 'income' ? 'Gelir Ekle' : 'Gider Ekle'}
            </MobileButton>

            <MobileButton
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => router.back()}
            >
              İptal
            </MobileButton>
          </div>
        </form>
      </MobileCard>

      {categories.length === 0 && (
        <MobileCard className="text-center text-gray-500 space-y-2">
          <Tag className="h-8 w-8 mx-auto text-gray-300" />
          <p className="text-sm">
            {type === 'income' ? 'Gelir' : 'Gider'} kategorisi bulunamadı
          </p>
          <p className="text-xs">
            Önce kategoriler sayfasından kategori ekleyin
          </p>
        </MobileCard>
      )}
    </div>
  )
}