'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function Workout() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [startTime] = useState(new Date())

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
        .limit(20) // จำกัด 20 ท่า

      if (error) throw error
      // กรองท่าที่ไม่ใช่การพัก (ถ้าต้องการ)
      const filtered = (data || []).filter(ex => ex.name !== 'พักดื่มน้ำ / หายใจลึกๆ')
      setExercises(filtered)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    const currentExercise = exercises[currentIndex]
    if (currentExercise) {
      const newSet = new Set(completedExercises)
      newSet.add(currentExercise.id)
      setCompletedExercises(newSet)
    }

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // จบทุกท่าแล้ว - บันทึกรายวัน
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleComplete = async () => {
    setSaving(true)
    setError(null)

    try {
      const today = new Date().toISOString().split('T')[0]
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) // นาที

      // บันทึกรายวัน
      const { error: logError } = await supabase
        .from('daily_logs')
        .upsert({
          date: today,
          completed: true,
          notes: `ออกกำลังกายเสร็จ ${completedExercises.size + 1}/${exercises.length} ท่า ใช้เวลา ${duration} นาที`,
        }, {
          onConflict: 'date'
        })

      if (logError) throw logError

      // ไปหน้าสรุป
      router.push('/workout/complete')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">กำลังโหลดท่าออกกำลังกาย...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">เกิดข้อผิดพลาด: {error}</div>
        <Link href="/" className="button" style={{ display: 'inline-block', marginTop: '20px' }}>
          กลับหน้าหลัก
        </Link>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>ยังไม่มีท่าออกกำลังกาย</h3>
          <p>ไปเพิ่มท่าออกกำลังกายก่อนที่หน้า ตารางออกกำลังกาย</p>
          <Link href="/workout-plan" className="button" style={{ display: 'inline-block', marginTop: '20px' }}>
            ไปที่ตารางออกกำลังกาย
          </Link>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100
  const isCompleted = completedExercises.has(currentExercise.id)
  const isLast = currentIndex === exercises.length - 1

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>💪 ออกกำลังกาย</h1>
          <Link href="/" style={{ color: '#667eea', textDecoration: 'none' }}>
            ✕ ยกเลิก
          </Link>
        </div>
        
        {/* Progress Bar */}
        <div style={{ 
          background: '#e0e0e0', 
          borderRadius: '10px', 
          height: '20px', 
          marginBottom: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: '100%',
            width: `${progress}%`,
            transition: 'width 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {currentIndex + 1}/{exercises.length}
          </div>
        </div>
        <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
          ท่า {currentIndex + 1} จาก {exercises.length}
        </div>
      </div>

      {/* Exercise Card */}
      <div className="card" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '12px 12px 0 0',
          margin: '-20px -20px 20px -20px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
            {isCompleted ? '✅' : '🏋️'}
          </div>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'white' }}>
            {currentExercise.name}
          </h2>
        </div>

        {currentExercise.muscle_group && (
          <div style={{ 
            background: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            color: '#667eea',
            fontWeight: '600'
          }}>
            🎯 {currentExercise.muscle_group}
          </div>
        )}

        {currentExercise.reps_target && (
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#333', 
            marginBottom: '20px',
            padding: '15px',
            background: '#fff3cd',
            borderRadius: '8px'
          }}>
            {currentExercise.reps_target}
          </div>
        )}

        {currentExercise.instructions && (
          <div style={{ 
            textAlign: 'left', 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            borderLeft: '4px solid #667eea'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '10px', color: '#333' }}>
              📝 วิธีการทำ:
            </div>
            <div style={{ color: '#666', whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              {currentExercise.instructions}
            </div>
          </div>
        )}

        {currentExercise.video_url && (
          <div style={{ marginBottom: '20px' }}>
            <a 
              href={currentExercise.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="button"
              style={{ 
                display: 'inline-block',
                textDecoration: 'none'
              }}
            >
              ▶️ ดูวิดีโอสอน
            </a>
          </div>
        )}

        {isCompleted && (
          <div style={{ 
            background: '#d4edda', 
            color: '#155724', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            ✅ ทำเสร็จแล้ว!
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px' }}>
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="button button-secondary"
          style={{ 
            opacity: currentIndex === 0 ? 0.5 : 1,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← ก่อนหน้า
        </button>

        {isLast ? (
          <button
            onClick={handleComplete}
            disabled={saving}
            className="button"
            style={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {saving ? 'กำลังบันทึก...' : '✅ เสร็จสิ้น - บันทึกรายวัน'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="button"
            style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            {isCompleted ? '➡️ ท่าถัดไป' : '✅ ทำเสร็จ - ถัดไป'}
          </button>
        )}

        {!isLast && (
          <button
            onClick={handleSkip}
            className="button button-secondary"
            style={{ fontSize: '0.9rem' }}
          >
            ข้าม →
          </button>
        )}
      </div>

      {/* Exercise List Preview */}
      <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '1.1rem' }}>
          รายการท่าทั้งหมด:
        </h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {exercises.map((ex, idx) => (
            <div
              key={ex.id}
              style={{
                padding: '10px',
                background: idx === currentIndex ? '#667eea' : 'white',
                color: idx === currentIndex ? 'white' : '#333',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.9rem',
                border: idx === currentIndex ? '2px solid #764ba2' : '1px solid #e0e0e0'
              }}
            >
              <span style={{ fontWeight: 'bold', minWidth: '30px' }}>
                {idx + 1}.
              </span>
              <span style={{ flex: 1 }}>{ex.name}</span>
              {completedExercises.has(ex.id) && (
                <span style={{ fontSize: '1.2rem' }}>✅</span>
              )}
              {idx === currentIndex && !completedExercises.has(ex.id) && (
                <span style={{ fontSize: '1.2rem' }}>👈</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
