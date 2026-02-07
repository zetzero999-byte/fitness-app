'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowLeft, Calendar, FileText, Trash2, Save, X, Loader2, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
        <div className="loading flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          กำลังโหลด...
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="flex items-center justify-center gap-3">
          <Plus className="w-8 h-8 md:w-10 md:h-10" />
          เพิ่ม Workout ใหม่
        </h1>
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
      {success && (
        <div className="success">
          <strong>บันทึกสำเร็จ!</strong> กำลังกลับไปหน้าหลัก...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="workout-name">ชื่อ Workout *</label>
          <input
            id="workout-name"
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
            placeholder="เช่น วันที่ 1 - แขนและไหล่"
          />
        </div>

        <div className="form-group">
          <label htmlFor="workout-date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            วันที่ *
          </label>
          <input
            id="workout-date"
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            required
            aria-label="เลือกวันที่ออกกำลังกาย"
          />
        </div>

        <div className="form-group">
          <label htmlFor="workout-notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            หมายเหตุ
          </label>
          <textarea
            id="workout-notes"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            rows={3}
            placeholder="เพิ่มหมายเหตุเกี่ยวกับ workout นี้..."
          />
        </div>

        <div className="mt-8 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            แบบฝึกหัด
          </h3>
          {workoutExercises.length === 0 ? (
            <p className="text-gray-500 mb-4">ยังไม่มีแบบฝึกหัด</p>
          ) : (
            <div className="space-y-4">
              {workoutExercises.map((exercise, index) => (
                <div key={index} className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">แบบฝึกหัด #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="button button-danger flex items-center gap-2 px-3 py-2 text-sm"
                      aria-label={`ลบแบบฝึกหัด ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`exercise-${index}`}>แบบฝึกหัด *</label>
                    <select
                      id={`exercise-${index}`}
                      value={exercise.exercise_id}
                      onChange={(e) => updateExercise(index, 'exercise_id', e.target.value)}
                      required
                      aria-label={`เลือกแบบฝึกหัด ${index + 1}`}
                    >
                      <option value="">เลือกแบบฝึกหัด</option>
                      {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} {ex.muscle_group ? `(${ex.muscle_group})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor={`sets-${index}`}>จำนวนเซ็ต</label>
                      <input
                        id={`sets-${index}`}
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                        placeholder="เช่น 3"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`reps-${index}`}>จำนวนครั้ง (Reps)</label>
                      <input
                        id={`reps-${index}`}
                        type="number"
                        min="1"
                        value={exercise.reps || ''}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="เช่น 12"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`weight-${index}`}>น้ำหนัก (กก.)</label>
                      <input
                        id={`weight-${index}`}
                        type="number"
                        step="0.5"
                        min="0"
                        value={exercise.weight_kg || ''}
                        onChange={(e) => updateExercise(index, 'weight_kg', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="เช่น 20"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`duration-${index}`}>ระยะเวลา (นาที)</label>
                      <input
                        id={`duration-${index}`}
                        type="number"
                        min="1"
                        value={exercise.duration_minutes || ''}
                        onChange={(e) => updateExercise(index, 'duration_minutes', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="เช่น 30"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`notes-${index}`}>หมายเหตุ</label>
                    <input
                      id={`notes-${index}`}
                      type="text"
                      value={exercise.notes || ''}
                      onChange={(e) => updateExercise(index, 'notes', e.target.value || null)}
                      placeholder="หมายเหตุเพิ่มเติม..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addExercise}
            className="button button-secondary flex items-center gap-2 w-full mt-4"
          >
            <Plus className="w-5 h-5" />
            เพิ่มแบบฝึกหัด
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mt-8">
          <button 
            type="submit" 
            className="button flex items-center justify-center gap-2 flex-1" 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                บันทึก Workout
              </>
            )}
          </button>
          <Link 
            href="/" 
            className="button button-secondary flex items-center justify-center gap-2 flex-1"
          >
            <X className="w-5 h-5" />
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  )
}
