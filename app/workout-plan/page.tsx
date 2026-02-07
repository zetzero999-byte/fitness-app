'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
        <h1>📋 ตารางออกกำลังกาย</h1>
        <p>ท่าออกกำลังกายทั้งหมด</p>
      </div>

      <Link href="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#667eea' }}>
        ← กลับหน้าหลัก
      </Link>

      {error && <div className="error">เกิดข้อผิดพลาด: {error}</div>}

      <div style={{ marginBottom: '20px' }}>
        {!showAddForm ? (
          <button onClick={() => setShowAddForm(true)} className="button">
            ➕ เพิ่มท่าออกกำลังกาย
          </button>
        ) : (
          <div className="card">
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>กลุ่มกล้ามเนื้อ</label>
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
                <label>ลิงก์วิดีโอ YouTube</label>
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
          ท่าออกกำลังกายทั้งหมด ({exercises.length})
        </h2>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : exercises.length === 0 ? (
          <div className="empty-state">
            <h3>ยังไม่มีท่าออกกำลังกาย</h3>
            <p>เริ่มต้นด้วยการเพิ่มท่าออกกำลังกายแรกของคุณ หรือรัน seed data จากไฟล์ supabase-seed-data.sql</p>
          </div>
        ) : (
          exercises.map((exercise, index) => (
            <div key={exercise.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ 
                      background: '#667eea', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '30px', 
                      height: '30px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {index + 1}
                    </span>
                    <h3 style={{ margin: 0, color: '#333', fontSize: '1.3rem' }}>{exercise.name}</h3>
                  </div>
                  
                  {exercise.muscle_group && (
                    <div style={{ color: '#667eea', marginBottom: '8px', fontWeight: '600' }}>
                      🎯 {exercise.muscle_group}
                    </div>
                  )}
                  
                  {exercise.reps_target && (
                    <div style={{ color: '#666', marginBottom: '8px', fontSize: '1rem' }}>
                      <strong>จำนวน:</strong> {exercise.reps_target}
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

              {exercise.instructions && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '10px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>วิธีการทำ:</div>
                  <div style={{ color: '#666', whiteSpace: 'pre-line' }}>{exercise.instructions}</div>
                </div>
              )}

              {exercise.video_url && (
                <div style={{ marginBottom: '10px' }}>
                  <a 
                    href={exercise.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#667eea', 
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    ▶️ ดูวิดีโอสอน
                  </a>
                </div>
              )}

              {exercise.description && (
                <div style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '10px' }}>
                  {exercise.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
