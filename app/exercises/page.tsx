'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

    try {
      if (editingId) {
        // อัปเดต
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
        // สร้างใหม่
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
        <h1>🏋️ จัดการแบบฝึกหัด</h1>
        <p>เพิ่ม แก้ไข และลบแบบฝึกหัด</p>
      </div>

      <Link href="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#667eea' }}>
        ← กลับหน้าหลัก
      </Link>

      {error && <div className="error">เกิดข้อผิดพลาด: {error}</div>}

      <div style={{ marginBottom: '20px' }}>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="button">
            ➕ เพิ่มแบบฝึกหัดใหม่
          </button>
        ) : (
          <div className="card">
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
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
                <label>กลุ่มกล้ามเนื้อ</label>
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="button">
                  {editingId ? '💾 บันทึกการแก้ไข' : '💾 บันทึก'}
                </button>
                <button type="button" onClick={cancelForm} className="button button-secondary">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          แบบฝึกหัดทั้งหมด ({exercises.length})
        </h2>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : exercises.length === 0 ? (
          <div className="empty-state">
            <h3>ยังไม่มีแบบฝึกหัด</h3>
            <p>เริ่มต้นด้วยการเพิ่มแบบฝึกหัดแรกของคุณ!</p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{exercise.name}</div>
                  {exercise.muscle_group && (
                    <div style={{ color: '#667eea', fontSize: '0.9rem', marginTop: '5px' }}>
                      🎯 {exercise.muscle_group}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="button button-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="button button-danger"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
              {exercise.description && (
                <p style={{ color: '#666', marginTop: '10px' }}>{exercise.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
