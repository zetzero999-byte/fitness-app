# 🚀 คู่มือการ Deploy บน Vercel

## ขั้นตอนการ Deploy

### 1. เตรียมโค้ด

```bash
# ตรวจสอบว่าโค้ดพร้อมแล้ว
npm run build
```

### 2. Push ไป GitHub

```bash
# สร้าง Git repository (ถ้ายังไม่มี)
git init
git add .
git commit -m "Ready for deployment"

# สร้าง repository บน GitHub แล้ว push
git remote add origin https://github.com/yourusername/fitness-app.git
git branch -M main
git push -u origin main
```

### 3. Deploy บน Vercel

#### วิธีที่ 1: ผ่านเว็บไซต์ (แนะนำ)

1. ไปที่ [vercel.com](https://vercel.com)
2. Login ด้วย GitHub account
3. คลิก **"Add New Project"**
4. เลือก repository ของคุณ
5. Vercel จะ detect Next.js อัตโนมัติ
6. คลิก **"Deploy"**

#### วิธีที่ 2: ผ่าน Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### 4. ตั้งค่า Environment Variables

**สำคัญมาก!** ต้องตั้งค่า Environment Variables ใน Vercel:

1. ไปที่ Project Settings > Environment Variables
2. เพิ่มตัวแปรต่อไปนี้:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL จาก Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key จาก Supabase Dashboard > Settings > API |

3. เลือก Environment: **Production, Preview, Development** (เลือกทั้งหมด)
4. คลิก **Save**
5. ไปที่ **Deployments** tab
6. คลิก **...** ที่ deployment ล่าสุด
7. คลิก **Redeploy** เพื่อให้ environment variables มีผล

### 5. ตรวจสอบ Database

1. ไปที่ Supabase Dashboard
2. ไปที่ SQL Editor
3. รันไฟล์ `supabase-complete.sql` (ถ้ายังไม่ได้รัน)
4. ตรวจสอบว่ามีข้อมูลท่าออกกำลังกาย 10 ท่าแล้ว

### 6. ทดสอบ

1. เปิด URL ที่ Vercel ให้มา (เช่น `https://your-app.vercel.app`)
2. ทดสอบฟีเจอร์ต่างๆ:
   - หน้าแรก
   - เริ่มออกกำลังกาย
   - บันทึกรายวัน
   - ตารางออกกำลังกาย

## 🔧 Troubleshooting

### Build Error

```bash
# ทดสอบ build เองก่อน
npm run build
```

### Environment Variables ไม่ทำงาน

- ตรวจสอบว่าใส่ `NEXT_PUBLIC_` prefix แล้ว
- Redeploy หลังจากเพิ่ม environment variables
- ตรวจสอบใน Vercel Dashboard > Settings > Environment Variables

### Database Connection Error

- ตรวจสอบว่า Supabase URL และ Key ถูกต้อง
- ตรวจสอบว่า Supabase project ยัง active อยู่
- ตรวจสอบ RLS policies ใน Supabase

### 404 Error

- ตรวจสอบว่าไฟล์อยู่ใน `app/` directory
- ตรวจสอบ routing ใน Next.js

## 📝 หมายเหตุ

- Vercel จะ build อัตโนมัติทุกครั้งที่ push code ไป GitHub
- สามารถตั้งค่า custom domain ได้ใน Project Settings
- ใช้ Vercel Analytics เพื่อดูสถิติการใช้งาน (ถ้าต้องการ)

## 🔗 Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
