'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Workout {
  id: string
  name: string
  date: string
  notes: string | null
  created_at: string
}

interface WorkoutExercise {
  id: string
  exercise: {
    id: string
    name: string
    description: string | null
    muscle_group: string | null
  }
  sets: number
  reps: number | null
  weight_kg: number | null
  duration_minutes: number | null
  notes: string | null
}

export default function WorkoutDetail() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchWorkout()
    }
  }, [params.id])

  const fetchWorkout = async () => {
    try {
      setLoading(true)
      const workoutId = params.id as string

      // ดึงข้อมูล workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single()

      if (workoutError) throw workoutError
      setWorkout(workoutData)

      // ดึงข้อมูล exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('created_at')

      if (exercisesError) throw exercisesError
      setExercises(exercisesData || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">กำลังโหลด...</div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="container">
        <div className="error">{error || 'ไม่พบ workout'}</div>
        <Link href="/" className="button" style={{ display: 'inline-block', marginTop: '20px' }}>
          กลับหน้าหลัก
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{workout.name}</h1>
        <p>
          {new Date(workout.date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <Link href="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#667eea' }}>
        ← กลับหน้าหลัก
      </Link>

      {workout.notes && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>หมายเหตุ</h3>
          <p style={{ color: '#666' }}>{workout.notes}</p>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>แบบฝึกหัด ({exercises.length})</h2>

        {exercises.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีแบบฝึกหัดใน workout นี้</p>
          </div>
        ) : (
          exercises.map((we) => (
            <div key={we.id} className="exercise-item">
              <div className="exercise-name">
                {we.exercise.name}
                {we.exercise.muscle_group && (
                  <span style={{ color: '#999', fontSize: '0.9rem', marginLeft: '10px' }}>
                    ({we.exercise.muscle_group})
                  </span>
                )}
              </div>
              <div className="exercise-details">
                {we.sets > 0 && <span>เซ็ต: {we.sets} </span>}
                {we.reps && <span>• ครั้ง: {we.reps} </span>}
                {we.weight_kg && <span>• น้ำหนัก: {we.weight_kg} กก. </span>}
                {we.duration_minutes && <span>• ระยะเวลา: {we.duration_minutes} นาที </span>}
              </div>
              {we.notes && (
                <div style={{ marginTop: '8px', color: '#666', fontSize: '0.9rem' }}>
                  💬 {we.notes}
                </div>
              )}
              {we.exercise.description && (
                <div style={{ marginTop: '8px', color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  {we.exercise.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
