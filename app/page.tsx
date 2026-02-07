'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
        <h1>💪 แอพออกกำลังกาย</h1>
        <p>ติดตามการออกกำลังกายของคุณ</p>
      </div>

      {error && <div className="error">เกิดข้อผิดพลาด: {error}</div>}

      <div className="actions">
        <Link href="/workout" className="button" style={{ 
          display: 'block', 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          fontSize: '1.2rem',
          padding: '15px',
          fontWeight: 'bold'
        }}>
          🏋️ เริ่มออกกำลังกาย
        </Link>
        <Link href="/daily-log" className="button" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
          📅 บันทึกรายวัน
        </Link>
        <Link href="/workout-plan" className="button" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          📋 ตารางออกกำลังกาย
        </Link>
        <Link href="/workouts/new" className="button button-secondary" style={{ display: 'block', textAlign: 'center' }}>
          ➕ เพิ่ม Workout ใหม่
        </Link>
        <Link href="/exercises" className="button button-secondary" style={{ display: 'block', textAlign: 'center' }}>
          🏋️ จัดการแบบฝึกหัด
        </Link>
        <Link href="/test-db" className="button button-secondary" style={{ display: 'block', textAlign: 'center', fontSize: '0.9rem' }}>
          🔍 ทดสอบ Database
        </Link>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Workouts ล่าสุด</h2>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : workouts.length === 0 ? (
          <div className="empty-state">
            <h3>ยังไม่มี Workout</h3>
            <p>เริ่มต้นด้วยการเพิ่ม workout แรกของคุณ!</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{workout.name}</div>
                  <div className="card-date">
                    {new Date(workout.date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link href={`/workouts/${workout.id}`} className="button button-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    ดู
                  </Link>
                  <button
                    onClick={() => deleteWorkout(workout.id)}
                    className="button button-danger"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
              {workout.notes && (
                <p style={{ color: '#666', marginTop: '10px' }}>{workout.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
