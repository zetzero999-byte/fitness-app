'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Database, CheckCircle2, XCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const testResults: any = {}

    try {
      const { data, error } = await supabase.from('exercises').select('count').limit(1)
      testResults.connection = error ? { success: false, error: error.message } : { success: true }
    } catch (err: any) {
      testResults.connection = { success: false, error: err.message }
    }

    try {
      const { data, error } = await supabase.from('exercises').select('*').limit(1)
      testResults.exercises = error 
        ? { success: false, error: error.message, exists: false }
        : { success: true, exists: true, count: data?.length || 0 }
    } catch (err: any) {
      testResults.exercises = { success: false, error: err.message, exists: false }
    }

    try {
      const { data, error } = await supabase.from('daily_logs').select('*').limit(1)
      testResults.daily_logs = error 
        ? { success: false, error: error.message, exists: false }
        : { success: true, exists: true, count: data?.length || 0 }
    } catch (err: any) {
      testResults.daily_logs = { success: false, error: err.message, exists: false }
    }

    try {
      const { data, error } = await supabase.from('workouts').select('*').limit(1)
      testResults.workouts = error 
        ? { success: false, error: error.message, exists: false }
        : { success: true, exists: true, count: data?.length || 0 }
    } catch (err: any) {
      testResults.workouts = { success: false, error: err.message, exists: false }
    }

    try {
      const { data, error } = await supabase.from('exercises').select('id, name, reps_target, instructions, video_url').limit(1)
      if (error) throw error
      const firstExercise = data?.[0]
      testResults.exercises_fields = {
        success: true,
        has_reps_target: 'reps_target' in (firstExercise || {}),
        has_instructions: 'instructions' in (firstExercise || {}),
        has_video_url: 'video_url' in (firstExercise || {}),
      }
    } catch (err: any) {
      testResults.exercises_fields = { success: false, error: err.message }
    }

    setResults(testResults)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          กำลังทดสอบการเชื่อมต่อ...
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="flex items-center justify-center gap-3">
          <Database className="w-8 h-8 md:w-10 md:h-10" />
          ทดสอบการเชื่อมต่อ Database
        </h1>
      </div>

      <Link href="/" className="back-link flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        กลับหน้าหลัก
      </Link>

      <div className="space-y-5">
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">1. การเชื่อมต่อ Supabase</h3>
          {results.connection?.success ? (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              เชื่อมต่อสำเร็จ
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                <XCircle className="w-5 h-5" />
                เชื่อมต่อไม่สำเร็จ
              </div>
              <div className="text-gray-600 text-sm">Error: {results.connection?.error}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">2. ตาราง exercises</h3>
          {results.exercises?.exists ? (
            <div>
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                ตารางมีอยู่
              </div>
              <div className="text-gray-600">จำนวนข้อมูล: {results.exercises.count}</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                <XCircle className="w-5 h-5" />
                ตารางไม่มีอยู่
              </div>
              <div className="text-gray-600 text-sm mb-3">Error: {results.exercises?.error}</div>
              <div className="bg-yellow-50 p-4 rounded-lg text-sm border-l-4 border-yellow-500">
                <strong>วิธีแก้:</strong> รัน SQL schema จากไฟล์ <code className="bg-yellow-100 px-2 py-1 rounded">supabase-complete.sql</code> ใน Supabase SQL Editor
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">3. ตาราง daily_logs</h3>
          {results.daily_logs?.exists ? (
            <div>
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                ตารางมีอยู่
              </div>
              <div className="text-gray-600">จำนวนข้อมูล: {results.daily_logs.count}</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                <XCircle className="w-5 h-5" />
                ตารางไม่มีอยู่
              </div>
              <div className="text-gray-600 text-sm mb-3">Error: {results.daily_logs?.error}</div>
              <div className="bg-yellow-50 p-4 rounded-lg text-sm border-l-4 border-yellow-500">
                <strong>วิธีแก้:</strong> รัน SQL schema จากไฟล์ <code className="bg-yellow-100 px-2 py-1 rounded">supabase-complete.sql</code> ใน Supabase SQL Editor
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">4. ตาราง workouts</h3>
          {results.workouts?.exists ? (
            <div>
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                ตารางมีอยู่
              </div>
              <div className="text-gray-600">จำนวนข้อมูล: {results.workouts.count}</div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                <XCircle className="w-5 h-5" />
                ตารางไม่มีอยู่
              </div>
              <div className="text-gray-600 text-sm">Error: {results.workouts?.error}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">5. ฟิลด์ในตาราง exercises</h3>
          {results.exercises_fields?.success ? (
            <div>
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
                <CheckCircle2 className="w-5 h-5" />
                ตรวจสอบฟิลด์
              </div>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${results.exercises_fields.has_reps_target ? 'text-green-600' : 'text-red-600'}`}>
                  {results.exercises_fields.has_reps_target ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  reps_target
                </div>
                <div className={`flex items-center gap-2 ${results.exercises_fields.has_instructions ? 'text-green-600' : 'text-red-600'}`}>
                  {results.exercises_fields.has_instructions ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  instructions
                </div>
                <div className={`flex items-center gap-2 ${results.exercises_fields.has_video_url ? 'text-green-600' : 'text-red-600'}`}>
                  {results.exercises_fields.has_video_url ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  video_url
                </div>
              </div>
              {(!results.exercises_fields.has_reps_target || !results.exercises_fields.has_instructions || !results.exercises_fields.has_video_url) && (
                <div className="bg-yellow-50 p-4 rounded-lg text-sm border-l-4 border-yellow-500 mt-4">
                  <strong>วิธีแก้:</strong> ต้องรัน SQL schema ใหม่เพื่อเพิ่มฟิลด์เหล่านี้ หรือ ALTER TABLE exercises
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                <XCircle className="w-5 h-5" />
                ไม่สามารถตรวจสอบได้
              </div>
              <div className="text-gray-600 text-sm">Error: {results.exercises_fields?.error}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          ขั้นตอนการแก้ไข
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>ไปที่ <strong>Supabase Dashboard</strong> → <strong>SQL Editor</strong></li>
          <li>เปิดไฟล์ <code className="bg-blue-100 px-2 py-1 rounded">supabase-complete.sql</code> และคัดลอก SQL ทั้งหมด</li>
          <li>วางใน SQL Editor และกด <strong>Run</strong></li>
          <li>ถ้าตารางมีอยู่แล้ว ให้รันเฉพาะส่วนที่เพิ่มตาราง/ฟิลด์ใหม่</li>
          <li>รันไฟล์ <code className="bg-blue-100 px-2 py-1 rounded">supabase-complete.sql</code> เพื่อเพิ่มข้อมูลท่าทั้ง 10 ท่า</li>
          <li>รีเฟรชหน้านี้เพื่อตรวจสอบอีกครั้ง</li>
        </ol>
      </div>
    </div>
  )
}
