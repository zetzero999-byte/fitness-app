'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, X, CheckCircle2, Target, PlayCircle, FileText, ChevronLeft, ChevronRight, SkipForward, Loader2, ArrowLeft } from 'lucide-react'
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
        .limit(20)

      if (error) throw error
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
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60)

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
      router.push('/workout/complete')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl">
        <div className="loading flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          กำลังโหลดท่าออกกำลังกาย...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl">
        <div className="error">เกิดข้อผิดพลาด: {error}</div>
        <Link href="/" className="button inline-block mt-5">
          กลับหน้าหลัก
        </Link>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="container max-w-4xl">
        <div className="empty-state">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3>ยังไม่มีท่าออกกำลังกาย</h3>
          <p>ไปเพิ่มท่าออกกำลังกายก่อนที่หน้า ตารางออกกำลังกาย</p>
          <Link href="/workout-plan" className="button inline-block mt-5">
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
    <div className="container max-w-4xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="w-8 h-8" />
            ออกกำลังกาย
          </h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700 transition-colors">
            <X className="w-6 h-6" />
          </Link>
        </div>
        
        <div className="bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-700 h-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-300"
            style={{ width: `${progress}%` } as React.CSSProperties}
          >
            {currentIndex + 1}/{exercises.length}
          </div>
        </div>
        <div className="text-center text-gray-600 text-sm">
          ท่า {currentIndex + 1} จาก {exercises.length}
        </div>
      </div>

      <div className="card mb-8 text-center">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6 rounded-t-xl -m-6 mb-6">
          <div className="text-5xl mb-3">
            {isCompleted ? (
              <CheckCircle2 className="w-16 h-16 mx-auto" />
            ) : (
              <Activity className="w-16 h-16 mx-auto" />
            )}
          </div>
          <h2 className="text-3xl font-bold">{currentExercise.name}</h2>
        </div>

        {currentExercise.muscle_group && (
          <div className="bg-gray-100 p-3 rounded-lg mb-5 text-primary-600 font-semibold flex items-center justify-center gap-2">
            <Target className="w-5 h-5" />
            {currentExercise.muscle_group}
          </div>
        )}

        {currentExercise.reps_target && (
          <div className="text-2xl font-bold text-gray-800 mb-5 p-4 bg-yellow-50 rounded-lg">
            {currentExercise.reps_target}
          </div>
        )}

        {currentExercise.instructions && (
          <div className="text-left bg-gray-50 p-5 rounded-lg mb-5 border-l-4 border-primary-500">
            <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              วิธีการทำ:
            </div>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed">
              {currentExercise.instructions}
            </div>
          </div>
        )}

        {currentExercise.video_url && (
          <div className="mb-5">
            <a 
              href={currentExercise.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="button inline-flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              ดูวิดีโอสอน
            </a>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-5 font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            ทำเสร็จแล้ว!
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="button button-secondary flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          ก่อนหน้า
        </button>

        {isLast ? (
          <button
            onClick={handleComplete}
            disabled={saving}
            className="button bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center gap-2 py-2.5 text-sm flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                เสร็จสิ้น - บันทึกรายวัน
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleNext}
              className="button flex items-center justify-center gap-2 py-2.5 text-sm flex-1"
            >
              {isCompleted ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  ท่าถัดไป
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ทำเสร็จ - ถัดไป
                </>
              )}
            </button>
            <button
              onClick={handleSkip}
              className="button button-secondary flex items-center justify-center gap-2 text-sm py-2.5 flex-1 sm:flex-none sm:w-auto"
            >
              ข้าม
              <SkipForward className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="p-5 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">รายการท่าทั้งหมด:</h3>
        <div className="space-y-2">
          {exercises.map((ex, idx) => (
            <div
              key={ex.id}
              className={`p-3 rounded-lg flex items-center gap-3 text-sm transition-colors ${
                idx === currentIndex
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <span className="font-bold min-w-[30px]">{idx + 1}.</span>
              <span className="flex-1">{ex.name}</span>
              {completedExercises.has(ex.id) && (
                <CheckCircle2 className={`w-5 h-5 ${idx === currentIndex ? 'text-white' : 'text-green-600'}`} />
              )}
              {idx === currentIndex && !completedExercises.has(ex.id) && (
                <ArrowLeft className="w-5 h-5" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
