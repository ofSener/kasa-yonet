'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, X, Check, Palette } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#6366f1'
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    color: '#6366f1'
  })
  
  const supabase = createClient()

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4',
    '#84cc16', '#f97316', '#14b8a6', '#a855f7'
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('type')
      .order('name')

    if (data) {
      setCategories(data)
    }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('categories')
      .insert({
        name: formData.name,
        type: formData.type,
        color: formData.color,
        user_id: user.id
      })

    if (!error) {
      setFormData({ name: '', type: 'expense', color: '#6366f1' })
      setShowAddForm(false)
      fetchCategories()
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editFormData.name.trim()) return

    const { error } = await supabase
      .from('categories')
      .update({
        name: editFormData.name,
        color: editFormData.color
      })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      fetchCategories()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchCategories()
    }
  }

  const startEdit = (category: any) => {
    setEditingId(category.id)
    setEditFormData({
      name: category.name,
      color: category.color
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Kategori
        </button>
      </div>

      {/* Yeni Kategori Formu */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Yeni Kategori Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Kategori adı (ör: İnternet, Kira)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 text-gray-900 bg-white placeholder-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 text-gray-900 bg-white placeholder-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </select>

            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-gray-400" />
              <div className="flex gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Ekle
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ name: '', type: 'expense', color: '#6366f1' })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gelir Kategorileri */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h2 className="text-lg font-semibold text-green-800">Gelir Kategorileri</h2>
          </div>
          <div className="p-4 space-y-2">
            {incomeCategories.length > 0 ? (
              incomeCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  {editingId === category.id ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 text-gray-900 bg-white rounded flex-1"
                        />
                        <div className="flex gap-1">
                          {colors.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditFormData({ ...editFormData, color })}
                              className={`w-6 h-6 rounded-full border ${
                                editFormData.color === color ? 'border-gray-900' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdate(category.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Henüz gelir kategorisi yok</p>
            )}
          </div>
        </div>

        {/* Gider Kategorileri */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-800">Gider Kategorileri</h2>
          </div>
          <div className="p-4 space-y-2">
            {expenseCategories.length > 0 ? (
              expenseCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  {editingId === category.id ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 text-gray-900 bg-white rounded flex-1"
                        />
                        <div className="flex gap-1">
                          {colors.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditFormData({ ...editFormData, color })}
                              className={`w-6 h-6 rounded-full border ${
                                editFormData.color === color ? 'border-gray-900' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdate(category.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Henüz gider kategorisi yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Bilgi Notu */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>İpucu:</strong> İşletmenize özel kategoriler ekleyebilirsiniz. 
          Örnek: "İnternet (Nakit)", "İnternet (Kart)", "Malzeme Satışı", "Servis", "Elektrik", "Su" vb.
        </p>
      </div>
    </div>
  )
}