'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Settings, ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_group: string | null
  created_at: string
}

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_group: '',
  })

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (error) throw error
      setExercises(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('exercises')
          .update({
            name: formData.name,
            description: formData.description || null,
            muscle_group: formData.muscle_group || null,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert({
            name: formData.name,
            description: formData.description || null,
            muscle_group: formData.muscle_group || null,
          })

        if (error) throw error
      }

      setFormData({ name: '', description: '', muscle_group: '' })
      setShowForm(false)
      setEditingId(null)
      fetchExercises()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      muscle_group: exercise.muscle_group || '',
    })
    setEditingId(exercise.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบแบบฝึกหัดนี้หรือไม่?')) return

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchExercises()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const cancelForm = () => {
    setFormData({ name: '', description: '', muscle_group: '' })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="flex items-center justify-center gap-3">
          <Settings className="w-8 h-8 md:w-10 md:h-10" />
          จัดการแบบฝึกหัด
        </h1>
        <p>เพิ่ม แก้ไข และลบแบบฝึกหัด</p>
      </div>

      <Link href="/" className="back-link flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        กลับหน้าหลัก
      </Link>

      {error && (
        <div className="error">
          <strong>เกิดข้อผิดพลาด:</strong> {error}
        </div>
      )}

      <div className="mb-6">
        {!showForm ? (
          <button 
            onClick={() => setShowForm(true)} 
            className="button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            เพิ่มแบบฝึกหัดใหม่
          </button>
        ) : (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {editingId ? 'แก้ไขแบบฝึกหัด' : 'เพิ่มแบบฝึกหัดใหม่'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ชื่อแบบฝึกหัด *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="เช่น Bench Press, Squat, Deadlift"
                />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  กลุ่มกล้ามเนื้อ
                </label>
                <input
                  type="text"
                  value={formData.muscle_group}
                  onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                  placeholder="เช่น อก, แขน, ขา, ไหล่"
                />
              </div>

              <div className="form-group">
                <label>คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="อธิบายวิธีการทำแบบฝึกหัด..."
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="button flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingId ? 'บันทึกการแก้ไข' : 'บันทึก'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={cancelForm} 
                  className="button button-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          แบบฝึกหัดทั้งหมด ({exercises.length})
        </h2>

        {loading ? (
          <div className="loading flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังโหลด...
          </div>
        ) : exercises.length === 0 ? (
          <div className="empty-state">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3>ยังไม่มีแบบฝึกหัด</h3>
            <p>เริ่มต้นด้วยการเพิ่มแบบฝึกหัดแรกของคุณ!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-gray-800 mb-2">
                      {exercise.name}
                    </div>
                    {exercise.muscle_group && (
                      <div className="flex items-center gap-2 text-primary-600 font-semibold mb-2">
                        <Target className="w-4 h-4" />
                        {exercise.muscle_group}
                      </div>
                    )}
                    {exercise.description && (
                      <p className="text-gray-600 mt-2">{exercise.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="button button-secondary flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="button button-danger flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
