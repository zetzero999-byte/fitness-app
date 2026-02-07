'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowLeft, FileText, Activity, MessageSquare, Loader2, Target } from 'lucide-react'
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

      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single()

      if (workoutError) throw workoutError
      setWorkout(workoutData)

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
        <div className="loading flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          กำลังโหลด...
        </div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="container">
        <div className="error">{error || 'ไม่พบ workout'}</div>
        <Link href="/" className="button inline-block mt-5">
          กลับหน้าหลัก
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{workout.name}</h1>
        <p className="flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          {new Date(workout.date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <Link href="/" className="back-link flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        กลับหน้าหลัก
      </Link>

      {workout.notes && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            หมายเหตุ
          </h3>
          <p className="text-gray-600">{workout.notes}</p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          แบบฝึกหัด ({exercises.length})
        </h2>

        {exercises.length === 0 ? (
          <div className="empty-state">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>ยังไม่มีแบบฝึกหัดใน workout นี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((we) => (
              <div key={we.id} className="card border-l-4 border-primary-500">
                <div className="flex items-start gap-3 mb-3">
                  <Activity className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-lg font-bold text-gray-800 mb-2">
                      {we.exercise.name}
                      {we.exercise.muscle_group && (
                        <span className="text-gray-500 text-sm font-normal ml-2 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          ({we.exercise.muscle_group})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      {we.sets > 0 && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          เซ็ต: {we.sets}
                        </span>
                      )}
                      {we.reps && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          ครั้ง: {we.reps}
                        </span>
                      )}
                      {we.weight_kg && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          น้ำหนัก: {we.weight_kg} กก.
                        </span>
                      )}
                      {we.duration_minutes && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          ระยะเวลา: {we.duration_minutes} นาที
                        </span>
                      )}
                    </div>
                    {we.notes && (
                      <div className="mt-3 text-gray-600 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {we.notes}
                      </div>
                    )}
                    {we.exercise.description && (
                      <div className="mt-3 text-gray-500 text-sm italic">
                        {we.exercise.description}
                      </div>
                    )}
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
