'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function TestDB() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const testResults: any = {}

    // Test 1: เชื่อมต่อ Supabase
    try {
      const { data, error } = await supabase.from('exercises').select('count').limit(1)
      testResults.connection = error ? { success: false, error: error.message } : { success: true }
    } catch (err: any) {
      testResults.connection = { success: false, error: err.message }
    }

    // Test 2: ตรวจสอบตาราง exercises
    try {
      const { data, error } = await supabase.from('exercises').select('*').limit(1)
      testResults.exercises = error 
        ? { success: false, error: error.message, exists: false }
        : { success: true, exists: true, count: data?.length || 0 }
    } catch (err: any) {
      testResults.exercises = { success: false, error: err.message, exists: false }
    }

    // Test 3: ตรวจสอบตาราง daily_logs
    try {
      const { data, error } = await supabase.from('daily_logs').select('*').limit(1)
      testResults.daily_logs = error 
        ? { success: false, error: error.message, exists: false }
        : { success: true, exists: true, count: data?.length || 0 }
    } catch (err: any) {
      testResults.daily_logs = { success: false, error: err.message, exists: false }
    }

    // Test 4: ตรวจสอบตาราง workouts
    try {
      const { data, error } = await supabase.from('workouts').select('*').limit(1)
      testResults.workouts = error 
        ? { success: false, error: error.message, exists: false }
        : { success: true, exists: true, count: data?.length || 0 }
    } catch (err: any) {
      testResults.workouts = { success: false, error: err.message, exists: false }
    }

    // Test 5: ตรวจสอบฟิลด์ใน exercises
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
        <div className="loading">กำลังทดสอบการเชื่อมต่อ...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🔍 ทดสอบการเชื่อมต่อ Database</h1>
      </div>

      <Link href="/" style={{ display: 'inline-block', marginBottom: '20px', color: '#667eea' }}>
        ← กลับหน้าหลัก
      </Link>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Connection Test */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>1. การเชื่อมต่อ Supabase</h3>
          {results.connection?.success ? (
            <div style={{ color: '#3c3', fontWeight: '600' }}>✅ เชื่อมต่อสำเร็จ</div>
          ) : (
            <div>
              <div style={{ color: '#c33', fontWeight: '600', marginBottom: '10px' }}>❌ เชื่อมต่อไม่สำเร็จ</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Error: {results.connection?.error}</div>
            </div>
          )}
        </div>

        {/* Exercises Table */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>2. ตาราง exercises</h3>
          {results.exercises?.exists ? (
            <div>
              <div style={{ color: '#3c3', fontWeight: '600', marginBottom: '10px' }}>✅ ตารางมีอยู่</div>
              <div style={{ color: '#666' }}>จำนวนข้อมูล: {results.exercises.count}</div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#c33', fontWeight: '600', marginBottom: '10px' }}>❌ ตารางไม่มีอยู่</div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Error: {results.exercises?.error}</div>
              <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
                <strong>วิธีแก้:</strong> รัน SQL schema จากไฟล์ <code>supabase-schema.sql</code> ใน Supabase SQL Editor
              </div>
            </div>
          )}
        </div>

        {/* Daily Logs Table */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>3. ตาราง daily_logs</h3>
          {results.daily_logs?.exists ? (
            <div>
              <div style={{ color: '#3c3', fontWeight: '600', marginBottom: '10px' }}>✅ ตารางมีอยู่</div>
              <div style={{ color: '#666' }}>จำนวนข้อมูล: {results.daily_logs.count}</div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#c33', fontWeight: '600', marginBottom: '10px' }}>❌ ตารางไม่มีอยู่</div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Error: {results.daily_logs?.error}</div>
              <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
                <strong>วิธีแก้:</strong> รัน SQL schema จากไฟล์ <code>supabase-schema.sql</code> ใน Supabase SQL Editor (ต้องรันส่วนที่เพิ่มตาราง daily_logs)
              </div>
            </div>
          )}
        </div>

        {/* Workouts Table */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>4. ตาราง workouts</h3>
          {results.workouts?.exists ? (
            <div>
              <div style={{ color: '#3c3', fontWeight: '600', marginBottom: '10px' }}>✅ ตารางมีอยู่</div>
              <div style={{ color: '#666' }}>จำนวนข้อมูล: {results.workouts.count}</div>
            </div>
          ) : (
            <div>
              <div style={{ color: '#c33', fontWeight: '600', marginBottom: '10px' }}>❌ ตารางไม่มีอยู่</div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Error: {results.workouts?.error}</div>
            </div>
          )}
        </div>

        {/* Exercises Fields */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>5. ฟิลด์ในตาราง exercises</h3>
          {results.exercises_fields?.success ? (
            <div>
              <div style={{ color: '#3c3', fontWeight: '600', marginBottom: '10px' }}>✅ ตรวจสอบฟิลด์</div>
              <div style={{ marginTop: '10px', display: 'grid', gap: '5px' }}>
                <div style={{ color: results.exercises_fields.has_reps_target ? '#3c3' : '#c33' }}>
                  {results.exercises_fields.has_reps_target ? '✅' : '❌'} reps_target
                </div>
                <div style={{ color: results.exercises_fields.has_instructions ? '#3c3' : '#c33' }}>
                  {results.exercises_fields.has_instructions ? '✅' : '❌'} instructions
                </div>
                <div style={{ color: results.exercises_fields.has_video_url ? '#3c3' : '#c33' }}>
                  {results.exercises_fields.has_video_url ? '✅' : '❌'} video_url
                </div>
              </div>
              {(!results.exercises_fields.has_reps_target || !results.exercises_fields.has_instructions || !results.exercises_fields.has_video_url) && (
                <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', marginTop: '15px' }}>
                  <strong>วิธีแก้:</strong> ต้องรัน SQL schema ใหม่เพื่อเพิ่มฟิลด์เหล่านี้ หรือ ALTER TABLE exercises
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ color: '#c33', fontWeight: '600', marginBottom: '10px' }}>❌ ไม่สามารถตรวจสอบได้</div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Error: {results.exercises_fields?.error}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#e7f3ff', borderRadius: '12px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>📋 ขั้นตอนการแก้ไข</h3>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>ไปที่ <strong>Supabase Dashboard</strong> → <strong>SQL Editor</strong></li>
          <li>เปิดไฟล์ <code>supabase-schema.sql</code> และคัดลอก SQL ทั้งหมด</li>
          <li>วางใน SQL Editor และกด <strong>Run</strong></li>
          <li>ถ้าตารางมีอยู่แล้ว ให้รันเฉพาะส่วนที่เพิ่มตาราง/ฟิลด์ใหม่</li>
          <li>รันไฟล์ <code>supabase-seed-data.sql</code> เพื่อเพิ่มข้อมูลท่าทั้ง 10 ท่า</li>
          <li>รีเฟรชหน้านี้เพื่อตรวจสอบอีกครั้ง</li>
        </ol>
      </div>
    </div>
  )
}
