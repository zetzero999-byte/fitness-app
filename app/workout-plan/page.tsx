'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, ArrowLeft, Plus, Edit, Trash2, Target, PlayCircle, Save, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Exercise {
  id: string
  name: string
  muscle_group: string | null
  reps_target: string | null
  instructions: string | null
  video_url: string | null
  description: string | null
}

export default function WorkoutPlan() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    muscle_group: '',
    reps_target: '',
    instructions: '',
    video_url: '',
    description: '',
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
        .order('created_at')

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
            muscle_group: formData.muscle_group || null,
            reps_target: formData.reps_target || null,
            instructions: formData.instructions || null,
            video_url: formData.video_url || null,
            description: formData.description || null,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert({
            name: formData.name,
            muscle_group: formData.muscle_group || null,
            reps_target: formData.reps_target || null,
            instructions: formData.instructions || null,
            video_url: formData.video_url || null,
            description: formData.description || null,
          })

        if (error) throw error
      }

      setFormData({ name: '', muscle_group: '', reps_target: '', instructions: '', video_url: '', description: '' })
      setShowAddForm(false)
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
      muscle_group: exercise.muscle_group || '',
      reps_target: exercise.reps_target || '',
      instructions: exercise.instructions || '',
      video_url: exercise.video_url || '',
      description: exercise.description || '',
    })
    setEditingId(exercise.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบท่าออกกำลังกายนี้หรือไม่?')) return

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
    setFormData({ name: '', muscle_group: '', reps_target: '', instructions: '', video_url: '', description: '' })
    setShowAddForm(false)
    setEditingId(null)
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="flex items-center justify-center gap-3">
          <ClipboardList className="w-8 h-8 md:w-10 md:h-10" />
          ตารางออกกำลังกาย
        </h1>
        <p>ท่าออกกำลังกายทั้งหมด</p>
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
        {!showAddForm ? (
          <button 
            onClick={() => setShowAddForm(true)} 
            className="button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            เพิ่มท่าออกกำลังกาย
          </button>
        ) : (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {editingId ? 'แก้ไขท่าออกกำลังกาย' : 'เพิ่มท่าออกกำลังกายใหม่'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ชื่อท่า *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="เช่น Burpees, Push-ups"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    กลุ่มกล้ามเนื้อ
                  </label>
                  <input
                    type="text"
                    value={formData.muscle_group}
                    onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                    placeholder="เช่น อก, แขน, ขา"
                  />
                </div>

                <div className="form-group">
                  <label>จำนวนครั้ง/เวลา</label>
                  <input
                    type="text"
                    value={formData.reps_target}
                    onChange={(e) => setFormData({ ...formData, reps_target: e.target.value })}
                    placeholder="เช่น 10-12 ครั้ง, 45 วินาที"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>คำอธิบายวิธีการทำ</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  placeholder="อธิบายวิธีการทำท่าออกกำลังกาย..."
                />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  ลิงก์วิดีโอ YouTube
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="form-group">
                <label>หมายเหตุเพิ่มเติม</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="หมายเหตุเพิ่มเติม..."
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
          ท่าออกกำลังกายทั้งหมด ({exercises.length})
        </h2>

        {loading ? (
          <div className="loading flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังโหลด...
          </div>
        ) : exercises.length === 0 ? (
          <div className="empty-state">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3>ยังไม่มีท่าออกกำลังกาย</h3>
            <p>เริ่มต้นด้วยการเพิ่มท่าออกกำลังกายแรกของคุณ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="card">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
                    </div>
                    
                    {exercise.muscle_group && (
                      <div className="flex items-center gap-2 text-primary-600 font-semibold mb-2">
                        <Target className="w-4 h-4" />
                        {exercise.muscle_group}
                      </div>
                    )}
                    
                    {exercise.reps_target && (
                      <div className="text-gray-600 mb-2">
                        <strong>จำนวน:</strong> {exercise.reps_target}
                      </div>
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

                {exercise.instructions && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-3 border-l-4 border-primary-500">
                    <div className="font-semibold text-gray-800 mb-2">วิธีการทำ:</div>
                    <div className="text-gray-600 whitespace-pre-line">{exercise.instructions}</div>
                  </div>
                )}

                {exercise.video_url && (
                  <div className="mb-3">
                    <a 
                      href={exercise.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-2 font-medium transition-colors"
                    >
                      <PlayCircle className="w-5 h-5" />
                      ดูวิดีโอสอน
                    </a>
                  </div>
                )}

                {exercise.description && (
                  <div className="text-gray-500 text-sm italic mt-3">
                    {exercise.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
