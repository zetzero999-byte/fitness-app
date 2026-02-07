# 💪 แอพออกกำลังกาย

แอพออกกำลังกายง่ายๆ ที่สร้างด้วย Next.js และ Supabase สำหรับติดตามการออกกำลังกายของคุณ

## ✨ ฟีเจอร์

- 📝 เพิ่มและจัดการ Workouts
- 🏋️ เพิ่มและจัดการแบบฝึกหัด (Exercises)
- 📊 ดูรายละเอียดของแต่ละ Workout
- 💾 เก็บข้อมูลใน Supabase Database

## 🚀 การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ `.env.local` จาก `.env.local.example`:
```bash
cp .env.local.example .env.local
```

3. ตั้งค่า Supabase:
   - สร้างโปรเจกต์ใหม่ที่ [Supabase](https://supabase.com)
   - คัดลอก URL และ Anon Key จาก Settings > API
   - ใส่ค่าในไฟล์ `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. สร้าง Database Tables:
   - ไปที่ SQL Editor ใน Supabase Dashboard
   - รัน SQL จากไฟล์ `supabase-schema.sql`

5. รันแอพ:
```bash
npm run dev
```

6. เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## 📁 โครงสร้างโปรเจกต์

```
├── app/
│   ├── exercises/          # หน้าจัดการแบบฝึกหัด
│   ├── workouts/           # หน้าจัดการ workouts
│   │   ├── new/            # เพิ่ม workout ใหม่
│   │   └── [id]/           # ดูรายละเอียด workout
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # หน้าหลัก
│   └── globals.css         # Global styles
├── lib/
│   └── supabase.ts         # Supabase client
├── supabase-schema.sql     # Database schema
└── package.json
```

## 🗄️ Database Schema

- **exercises**: เก็บข้อมูลแบบฝึกหัด
- **workouts**: เก็บข้อมูลการออกกำลังกายแต่ละครั้ง
- **workout_exercises**: เก็บความสัมพันธ์ระหว่าง workouts และ exercises พร้อมรายละเอียด (sets, reps, weight, etc.)

## 🎨 ฟีเจอร์ที่สามารถเพิ่มได้

- [ ] Authentication (Login/Register)
- [ ] กราฟแสดงความก้าวหน้า
- [ ] แชร์ workouts กับเพื่อน
- [ ] แบบฝึกหัดแนะนำ
- [ ] Timer สำหรับ rest periods
- [ ] Export ข้อมูลเป็น PDF

## 🚀 Deploy บน Vercel

### วิธี Deploy:

1. **Push โค้ดไป GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy บน Vercel:**
   - ไปที่ [Vercel](https://vercel.com) และ Login
   - คลิก "Add New Project"
   - เลือก GitHub repository ของคุณ
   - Vercel จะ detect Next.js อัตโนมัติ

3. **ตั้งค่า Environment Variables:**
   - ในหน้า Project Settings > Environment Variables
   - เพิ่ม 2 ตัวแปร:
     - `NEXT_PUBLIC_SUPABASE_URL` = URL จาก Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Anon Key จาก Supabase
   - คลิก "Redeploy" เพื่อให้ environment variables มีผล

4. **รอ Deploy เสร็จ:**
   - Vercel จะ build และ deploy อัตโนมัติ
   - เมื่อเสร็จจะได้ URL เช่น `https://your-app.vercel.app`

### ⚠️ สิ่งสำคัญ:
- ต้องตั้งค่า Environment Variables ใน Vercel Dashboard
- ต้องรัน SQL schema (`supabase-complete.sql`) ใน Supabase ก่อนใช้งาน
- Vercel จะ build อัตโนมัติทุกครั้งที่ push code ไป GitHub

## 📝 License

MIT
