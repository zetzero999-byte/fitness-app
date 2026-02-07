-- ============================================
-- ไฟล์ SQL หลักสำหรับ Fitness App
-- รันไฟล์นี้ใน Supabase SQL Editor เพียงครั้งเดียว
-- ============================================

-- ============================================
-- ส่วนที่ 1: สร้าง/อัปเดตตาราง exercises
-- ============================================
DO $$ 
BEGIN
  -- สร้างตาราง exercises ถ้ายังไม่มี
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'exercises'
  ) THEN
    CREATE TABLE exercises (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      muscle_group TEXT,
      reps_target TEXT,
      instructions TEXT,
      video_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    RAISE NOTICE 'Created table exercises';
  ELSE
    RAISE NOTICE 'Table exercises already exists';
    
    -- เพิ่มฟิลด์ใหม่ถ้ายังไม่มี
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'reps_target'
    ) THEN
      ALTER TABLE exercises ADD COLUMN reps_target TEXT;
      RAISE NOTICE 'Added column reps_target';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'instructions'
    ) THEN
      ALTER TABLE exercises ADD COLUMN instructions TEXT;
      RAISE NOTICE 'Added column instructions';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'video_url'
    ) THEN
      ALTER TABLE exercises ADD COLUMN video_url TEXT;
      RAISE NOTICE 'Added column video_url';
    END IF;
  END IF;
END $$;

-- ============================================
-- ส่วนที่ 2: สร้างตาราง workouts
-- ============================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ส่วนที่ 3: สร้างตาราง workout_exercises
-- ============================================
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER DEFAULT 1,
  reps INTEGER,
  weight_kg DECIMAL(10, 2),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- ส่วนที่ 4: สร้างตาราง daily_logs
-- ============================================
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(date)
);

-- ============================================
-- ส่วนที่ 5: สร้าง Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);

-- ============================================
-- ส่วนที่ 6: ตั้งค่า Row Level Security (RLS)
-- ============================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ส่วนที่ 7: สร้าง Policies (ให้ทุกคนอ่าน/เขียนได้)
-- ============================================
DO $$ 
BEGIN
  -- Policy สำหรับ exercises
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'exercises' AND policyname = 'Allow all operations on exercises'
  ) THEN
    CREATE POLICY "Allow all operations on exercises" ON exercises
      FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Policy สำหรับ workouts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workouts' AND policyname = 'Allow all operations on workouts'
  ) THEN
    CREATE POLICY "Allow all operations on workouts" ON workouts
      FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Policy สำหรับ workout_exercises
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workout_exercises' AND policyname = 'Allow all operations on workout_exercises'
  ) THEN
    CREATE POLICY "Allow all operations on workout_exercises" ON workout_exercises
      FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Policy สำหรับ daily_logs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'daily_logs' AND policyname = 'Allow all operations on daily_logs'
  ) THEN
    CREATE POLICY "Allow all operations on daily_logs" ON daily_logs
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- ส่วนที่ 8: เพิ่มข้อมูลท่าออกกำลังกาย 10 ท่า
-- ============================================
-- ลบข้อมูลเก่าก่อน (ถ้ามี) แล้วเพิ่มใหม่
DELETE FROM exercises WHERE name IN (
  'Burpees', 'Diamond Push-ups', 'Jump Squats', 'Bicycle Crunches', 
  'Mountain Climbers', 'Walking Lunges', 'Plank Saw (แพลงก์แล้วโยกตัว)', 
  'Leg Raises', 'High Knees (วิ่งอยู่กับที่เข่าสูง)', 'พักดื่มน้ำ / หายใจลึกๆ'
);

INSERT INTO exercises (name, muscle_group, reps_target, instructions, video_url) VALUES
('Burpees', 'เผาผลาญทั้งร่าง', '10-12 ครั้ง', 'ยืนตรง ย่อตัวลงคุกเข่า วางมือสองข้างลงบนพื้น กระโดดถีบขาทั้งสองข้างไปด้านหลังให้อยู่ในท่า Plank (วิดพื้น) กระโดดดึงขากลับมาด้านหน้า แล้วกระโดดขึ้นฟ้าพร้อมชูมือ จุดที่ต้องระวัง: ตอนถีบขาไปด้านหลัง อย่าให้สะโพกตกหรือหลังแอ่น', 'https://www.youtube.com/watch?v=dZfeVteZqyc'),

('Diamond Push-ups', 'อกแน่นและหลังแขน', '12-15 ครั้ง', 'ตั้งท่าเหมือนวิดพื้นปกติ แต่ขยับมือทั้งสองข้างมาชิดกันใต้หน้าอก ให้ปลายนิ้วชี้และนิ้วโป้งชนกันเป็นรูปข้าวหลามตัด (หรือรูปเพชร) ยุบตัวลงจนหน้าอกเกือบแตะมือ แล้วดันตัวขึ้น จุดที่ต้องระวัง: ท่านี้เน้นหลังแขนและอกส่วนกลาง ถ้าหนักไปให้วางเข่าทำก่อน', 'https://www.youtube.com/watch?v=J0DnG1_S92I'),

('Jump Squats', 'ขาและก้น (ช่วยเบิร์นหนัก)', '15-20 ครั้ง', 'ยืนแยกเท้ากว้างเท่าหัวไหล่ ย่อสะโพกลงเหมือนนั่งเก้าอี้ (น้ำหนักลงที่ส้นเท้า) จังหวะดันตัวขึ้นให้ใช้แรงส่งกระโดดขึ้นจากพื้นให้สูงที่สุด จุดที่ต้องระวัง: ตอนลงให้ลงด้วยปลายเท้าแล้วย่อเข่าทันทีเพื่อลดแรงกระแทก', 'https://www.youtube.com/watch?v=Azl5tkCzDcc'),

('Bicycle Crunches', 'ซิกแพคบน-ข้าง', '30 ครั้ง (รวมซ้ายขวา)', 'นอนหงาย มือประสานที่ท้ายทอย ยกเข่าขึ้นทำมุม 90 องศา บิดลำตัวให้ศอกขวาไปแตะเข่าซ้าย (พร้อมเหยียดขาขวาตรง) และสลับทำอีกข้าง จุดที่ต้องระวัง: อย่ากระชากคอ ให้ใช้แรงจากหน้าท้องบิดลำตัว', 'https://www.youtube.com/watch?v=9FGilxCbdz8'),

('Mountain Climbers', 'หน้าท้องและคาร์ดิโอ', '40 ครั้ง (รวมซ้ายขวา)', 'เริ่มในท่า Plank แขนเหยียดตึง วิ่งสลับเข่าเข้ามาที่หน้าอกอย่างรวดเร็ว โดยที่ก้นไม่โด่งขึ้น จุดที่ต้องระวัง: เกร็งหน้าท้องให้แน่นตลอดเวลาเพื่อไม่ให้ตัวแกว่ง', 'https://www.youtube.com/watch?v=nmwics3n_NI'),

('Walking Lunges', 'ขาและแกนกลาง', '20 ก้าว', 'ก้าวขาข้างหนึ่งไปข้างหน้า แล้วย่อตัวลงจนเข่าหลังเกือบแตะพื้น (เข่าหน้าทำมุม 90 องศา) ดันตัวขึ้นแล้วก้าวขาอีกข้างสลับไปข้างหน้าเรื่อยๆ จุดที่ต้องระวัง: หลังต้องตรงเสมอ อย่าให้เข่าหน้ายื่นเลยปลายเท้า', 'https://www.youtube.com/watch?v=L8fvypPrzzs'),

('Plank Saw (แพลงก์แล้วโยกตัว)', 'ซิกแพคแน่นๆ', '45 วินาที (พัก 15 วิ)', 'ตั้งท่า Plank บนข้อศอก (Forearm Plank) ใช้ปลายเท้าดันตัวไปข้างหน้าและดึงกลับมาข้างหลังเหมือนใบเลื่อย จุดที่ต้องระวัง: รักษาลำตัวให้เป็นเส้นตรงขนานกับพื้นตลอดเวลา', 'https://www.youtube.com/watch?v=p799E_Wn68o'),

('Leg Raises', 'พุงล่าง (ร่อง V-Shape)', '15 ครั้ง', 'นอนหงาย มือวางราบข้างลำตัวหรือสอดใต้ก้น ยกขาทั้งสองข้างขึ้นพร้อมกันจนตั้งฉากกับพื้น แล้วค่อยๆ วางลงช้าๆ (แต่ไม่แตะพื้น) จุดที่ต้องระวัง: อย่าให้หลังส่วนล่างลอยจากพื้น ถ้าหลังลอยให้ยกขาทีละข้างสลับกันแทน', 'https://www.youtube.com/watch?v=l4kQd9eWclE'),

('High Knees (วิ่งอยู่กับที่เข่าสูง)', 'ดึงไขมันมาใช้', '50 ครั้ง (รวมซ้ายขวา)', 'วิ่งอยู่กับที่ พยายามยกเข่าให้สูงถึงระดับเอว แกว่งแขนช่วยและทำด้วยความเร็ว จุดที่ต้องระวัง: ลงน้ำหนักที่ปลายเท้าและเกร็งหน้าท้องเพื่อยกเข่า', 'https://www.youtube.com/watch?v=8opcQdC-VwE'),

('พักดื่มน้ำ / หายใจลึกๆ', 'เตรียมต่อรอบถัดไป', '1 นาทีเต็ม', 'พักผ่อน ดื่มน้ำ และหายใจลึกๆ เพื่อเตรียมพร้อมสำหรับรอบถัดไป', NULL);

-- ============================================
-- เสร็จสิ้น!
-- ============================================
SELECT 'Database setup completed successfully!' AS status;
