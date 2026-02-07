'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, CheckCircle2, MessageSquare, Trash2, ArrowLeft, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DailyLog {
  id: string
  date: string
  completed: boolean
  notes: string | null
  created_at: string
}

export default function DailyLog() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

      if (error) throw error
      setLogs(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          date: selectedDate,
          completed: true,
          notes: notes || null,
        }, {
          onConflict: 'date'
        })

      if (error) throw error

      setSuccess(true)
      setNotes('')
      setSelectedDate(new Date().toISOString().split('T')[0])
      fetchLogs()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteLog = async (id: string) => {
    if (!confirm('คุณต้องการลบบันทึกนี้หรือไม่?')) return

    try {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchLogs()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const isDateCompleted = (date: string) => {
    return logs.some(log => log.date === date && log.completed)
  }

  const weekCount = logs.filter(log => {
    const logDate = new Date(log.date)
    const today = new Date()
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return logDate >= thisWeek
  }).length

  const monthCount = logs.filter(log => {
    const logDate = new Date(log.date)
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    return logDate >= thisMonth
  }).length

  return (
    <div className="container">
      <div className="header">
        <h1 className="flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 md:w-10 md:h-10" />
          บันทึกรายวัน
        </h1>
        <p>บันทึกว่าวันนี้ออกกำลังกายเสร็จแล้ว</p>
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
          <strong>บันทึกสำเร็จ!</strong> 🎉
        </div>
      )}

      <div className="card mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">บันทึกการออกกำลังกาย</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="workout-date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              วันที่ *
            </label>
            <input
              id="workout-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              aria-label="เลือกวันที่ออกกำลังกาย"
              className="mt-2"
            />
            {isDateCompleted(selectedDate) && (
              <p className="text-green-600 mt-2 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                บันทึกแล้วสำหรับวันนี้
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="workout-notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              id="workout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="เช่น รู้สึกดีมาก, รู้สึกเหนื่อย, ทำครบทุกท่า..."
              aria-label="เพิ่มหมายเหตุเกี่ยวกับการออกกำลังกาย"
              className="mt-2"
            />
          </div>

          <button type="submit" className="button w-full md:w-auto" disabled={saving}>
            {saving ? (
              'กำลังบันทึก...'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                บันทึกว่าออกกำลังกายเสร็จแล้ว
              </span>
            )}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ประวัติการบันทึก</h2>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3>ยังไม่มีบันทึก</h3>
            <p>เริ่มต้นด้วยการบันทึกการออกกำลังกายวันแรกของคุณ!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {new Date(log.date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </div>
                    {log.notes && (
                      <p className="text-gray-600 flex items-start gap-2 mt-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {log.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="button button-danger flex items-center gap-2 px-4 py-2 text-sm self-start md:self-center"
                    aria-label="ลบบันทึก"
                  >
                    <Trash2 className="w-4 h-4" />
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            สถิติ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {logs.length}
              </div>
              <div className="text-gray-600">วันทั้งหมด</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {weekCount}
              </div>
              <div className="text-gray-600">สัปดาห์นี้</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-4xl font-bold text-primary-700 mb-2">
                {monthCount}
              </div>
              <div className="text-gray-600">เดือนนี้</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
