'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PartyPopper, Calendar, MessageSquare, TrendingUp, RotateCcw, Home, Dumbbell } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function WorkoutComplete() {
  const [todayLog, setTodayLog] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayLog()
  }, [])

  const fetchTodayLog = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setTodayLog(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl text-center">
      <div className="mb-8">
        <PartyPopper className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
        <h1 className="text-4xl font-bold text-gray-800 mb-3">ยินดีด้วย!</h1>
        <h2 className="text-2xl text-primary-600 font-semibold">
          คุณออกกำลังกายเสร็จแล้ว
        </h2>
      </div>

      {todayLog && (
        <div className="card mb-8 text-left">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            บันทึกวันนี้
          </h3>
          <div className="text-gray-600 mb-3">
            <strong>วันที่:</strong> {new Date(todayLog.date).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
          {todayLog.notes && (
            <div className="text-gray-600 flex items-start gap-2">
              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>หมายเหตุ:</strong> {todayLog.notes}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-8">
        <Link 
          href="/daily-log" 
          className="button bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center gap-2 w-full"
        >
          <TrendingUp className="w-5 h-5" />
          ดูประวัติการออกกำลังกาย
        </Link>
        
        <Link 
          href="/workout" 
          className="button flex items-center justify-center gap-2 w-full"
        >
          <RotateCcw className="w-5 h-5" />
          ออกกำลังกายอีกครั้ง
        </Link>

        <Link 
          href="/" 
          className="button button-secondary flex items-center justify-center gap-2 w-full"
        >
          <Home className="w-5 h-5" />
          กลับหน้าหลัก
        </Link>
      </div>

      <div className="p-6 bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl text-white">
        <Dumbbell className="w-12 h-12 mx-auto mb-4" />
        <div className="text-sm opacity-90">
          การออกกำลังกายสม่ำเสมอจะช่วยให้คุณมีสุขภาพที่ดีขึ้น!
        </div>
      </div>
    </div>
  )
}
