'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_group: string | null
}

interface WorkoutExercise {
  exercise_id: string
  sets: number
  reps: number | null
  weight_kg: number | null
  duration_minutes: number | null
  notes: string | null
}

export default function NewWorkout() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
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

  const addExercise = () => {
    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise_id: '',
        sets: 1,
        reps: null,
        weight_kg: null,
        duration_minutes: null,
        notes: null,
      },
    ])
  }

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...workoutExercises]
    updated[index] = { ...updated[index], [field]: value }
    setWorkoutExercises(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // สร้าง workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          name: workoutName,
          date: workoutDate,
          notes: workoutNotes || null,
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // สร้าง workout exercises
      if (workoutExercises.length > 0) {
        const exercisesToInsert = workoutExercises
          .filter((we) => we.exercise_id)
          .map((we) => ({
            workout_id: workout.id,
            exercise_id: we.exercise_id,
            sets: we.sets,
            reps: we.reps,
            weight_kg: we.weight_kg,
            duration_minutes: we.duration_minutes,
            notes: we.notes,
          }))

        if (exercisesToInsert.length > 0) {
          const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(exercisesToInsert)

          if (exercisesError) throw exercisesError
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>➕ เพิ่ม Workout ใหม่</h1>
      </div>

      <Link href="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#667eea' }}>
        ← กลับหน้าหลัก
      </Link>

      {error && <div className="error">เกิดข้อผิดพลาด: {error}</div>}
      {success && <div className="success">บันทึกสำเร็จ! กำลังกลับไปหน้าหลัก...</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ชื่อ Workout *</label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
            placeholder="เช่น วันที่ 1 - แขนและไหล่"
          />
        </div>

        <div className="form-group">
          <label>วันที่ *</label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>หมายเหตุ</label>
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            rows={3}
            placeholder="เพิ่มหมายเหตุเกี่ยวกับ workout นี้..."
          />
        </div>

        <div style={{ marginTop: '30px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>แบบฝึกหัด</h3>
          {workoutExercises.length === 0 ? (
            <p style={{ color: '#999', marginBottom: '15px' }}>ยังไม่มีแบบฝึกหัด</p>
          ) : (
            workoutExercises.map((exercise, index) => (
              <div key={index} className="card" style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: '#333' }}>แบบฝึกหัด #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="button button-danger"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    ลบ
                  </button>
                </div>

                <div className="form-group">
                  <label>แบบฝึกหัด *</label>
                  <select
                    value={exercise.exercise_id}
                    onChange={(e) => updateExercise(index, 'exercise_id', e.target.value)}
                    required
                  >
                    <option value="">เลือกแบบฝึกหัด</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} {ex.muscle_group ? `(${ex.muscle_group})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>จำนวนเซ็ต</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-group">
                    <label>จำนวนครั้ง (Reps)</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.reps || ''}
                      onChange={(e) => updateExercise(index, 'reps', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="เช่น 12"
                    />
                  </div>

                  <div className="form-group">
                    <label>น้ำหนัก (กก.)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={exercise.weight_kg || ''}
                      onChange={(e) => updateExercise(index, 'weight_kg', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="เช่น 20"
                    />
                  </div>

                  <div className="form-group">
                    <label>ระยะเวลา (นาที)</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.duration_minutes || ''}
                      onChange={(e) => updateExercise(index, 'duration_minutes', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="เช่น 30"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>หมายเหตุ</label>
                  <input
                    type="text"
                    value={exercise.notes || ''}
                    onChange={(e) => updateExercise(index, 'notes', e.target.value || null)}
                    placeholder="หมายเหตุเพิ่มเติม..."
                  />
                </div>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addExercise}
            className="button button-secondary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            ➕ เพิ่มแบบฝึกหัด
          </button>
        </div>

        <div className="actions">
          <button type="submit" className="button" disabled={saving}>
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก Workout'}
          </button>
          <Link href="/" className="button button-secondary" style={{ textAlign: 'center' }}>
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
