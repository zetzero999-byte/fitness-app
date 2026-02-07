'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dumbbell, Calendar, ClipboardList, Plus, Settings, Eye, Trash2, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Workout {
  id: string
  name: string
  date: string
  notes: string | null
  created_at: string
}

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false })
        .limit(10)

      if (error) throw error
      setWorkouts(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteWorkout = async (id: string) => {
    if (!confirm('คุณต้องการลบ workout นี้หรือไม่?')) return

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchWorkouts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="flex items-center justify-center gap-3">
          <Dumbbell className="w-10 h-10 md:w-12 md:h-12" />
          แอพออกกำลังกาย
        </h1>
        <p>ติดตามการออกกำลังกายของคุณ</p>
      </div>

      {error && (
        <div className="error">
          <strong>เกิดข้อผิดพลาด:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <Link 
          href="/workout" 
          className="card hover:scale-105 transition-transform cursor-pointer text-center bg-gradient-to-br from-pink-500 to-red-500 text-white border-0"
        >
          <Activity className="w-8 h-8 mx-auto mb-3" />
          <div className="font-bold text-lg">เริ่มออกกำลังกาย</div>
        </Link>

        <Link 
          href="/daily-log" 
          className="card hover:scale-105 transition-transform cursor-pointer text-center bg-gradient-to-br from-teal-500 to-green-500 text-white border-0"
        >
          <Calendar className="w-8 h-8 mx-auto mb-3" />
          <div className="font-bold text-lg">บันทึกรายวัน</div>
        </Link>

        <Link 
          href="/workout-plan" 
          className="card hover:scale-105 transition-transform cursor-pointer text-center bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0"
        >
          <ClipboardList className="w-8 h-8 mx-auto mb-3" />
          <div className="font-bold text-lg">ตารางออกกำลังกาย</div>
        </Link>

        <Link 
          href="/workouts/new" 
          className="card hover:scale-105 transition-transform cursor-pointer text-center border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <Plus className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <div className="font-semibold text-gray-700">เพิ่ม Workout ใหม่</div>
        </Link>

        <Link 
          href="/exercises" 
          className="card hover:scale-105 transition-transform cursor-pointer text-center border-2 border-dashed border-gray-300 hover:border-primary-500"
        >
          <Settings className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <div className="font-semibold text-gray-700">จัดการแบบฝึกหัด</div>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Workouts ล่าสุด</h2>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : workouts.length === 0 ? (
          <div className="empty-state">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3>ยังไม่มี Workout</h3>
            <p>เริ่มต้นด้วยการเพิ่ม workout แรกของคุณ!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-gray-800 mb-2">
                      {workout.name}
                    </div>
                    <div className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(workout.date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    {workout.notes && (
                      <p className="text-gray-600 mt-2">{workout.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`/workouts/${workout.id}`} 
                      className="button button-secondary flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      ดู
                    </Link>
                    <button
                      onClick={() => deleteWorkout(workout.id)}
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
