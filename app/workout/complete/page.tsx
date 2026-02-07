'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
    <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎉</div>
      <h1 style={{ color: '#333', marginBottom: '10px' }}>ยินดีด้วย!</h1>
      <h2 style={{ color: '#667eea', marginBottom: '30px' }}>
        คุณออกกำลังกายเสร็จแล้ว
      </h2>

      {todayLog && (
        <div className="card" style={{ marginBottom: '30px', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>📅 บันทึกวันนี้</h3>
          <div style={{ color: '#666', marginBottom: '10px' }}>
            <strong>วันที่:</strong> {new Date(todayLog.date).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
          {todayLog.notes && (
            <div style={{ color: '#666' }}>
              <strong>หมายเหตุ:</strong> {todayLog.notes}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Link href="/daily-log" className="button" style={{ 
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          textAlign: 'center',
          textDecoration: 'none'
        }}>
          📊 ดูประวัติการออกกำลังกาย
        </Link>
        
        <Link href="/workout" className="button" style={{ 
          textAlign: 'center',
          textDecoration: 'none'
        }}>
          🔄 ออกกำลังกายอีกครั้ง
        </Link>

        <Link href="/" className="button button-secondary" style={{ 
          textAlign: 'center',
          textDecoration: 'none'
        }}>
          🏠 กลับหน้าหลัก
        </Link>
      </div>

      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '12px',
        color: 'white'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>💪</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          การออกกำลังกายสม่ำเสมอจะช่วยให้คุณมีสุขภาพที่ดีขึ้น!
        </div>
      </div>
    </div>
  )
}
