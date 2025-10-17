# 🔧 SUPABASE STORAGE FIX - PASTE THIS SQL

## ⚠️ IMPORTANT: Run this ONCE in your Supabase SQL Editor

This will fix the video upload issue by creating the storage bucket and policies.

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### 1. Open Supabase SQL Editor
- Go to [https://app.supabase.com](https://app.supabase.com)
- Select your project
- Click **SQL Editor** in the left sidebar
- Click **New Query**

### 2. Copy and paste THIS ENTIRE SQL BLOCK:

```sql
-- ============================================
-- STORAGE BUCKET AND POLICIES SETUP
-- This fixes video uploads
-- ============================================

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-videos', 'lesson-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete lesson videos" ON storage.objects;

-- Step 4: Create storage policies

-- Allow everyone to view videos
CREATE POLICY "Anyone can view lesson videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-videos');

-- Allow admins to upload videos
CREATE POLICY "Admins can upload lesson videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update videos
CREATE POLICY "Admins can update lesson videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete videos
CREATE POLICY "Admins can delete lesson videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Step 5: Verify it worked
SELECT 
  id, 
  name, 
  public,
  'Bucket created successfully!' as status
FROM storage.buckets 
WHERE id = 'lesson-videos';
```

### 3. Click **RUN** (or press Cmd+Enter on Mac)

### 4. You should see:
```
id              | name           | public | status
----------------|----------------|--------|---------------------------
lesson-videos   | lesson-videos  | true   | Bucket created successfully!
```

---

## ✅ VERIFY IT WORKED

Run this SQL to check everything:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'lesson-videos';

-- Check policies exist
SELECT policyname 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Should show 4 policies:
-- 1. Anyone can view lesson videos
-- 2. Admins can upload lesson videos
-- 3. Admins can update lesson videos
-- 4. Admins can delete lesson videos
```

---

## 🎯 NOW TEST IN YOUR APP

1. Go to your admin dashboard: `https://course-topaz-one.vercel.app/dashboard/admin`
2. Create or select a course
3. Click **Save course**
4. Click **Upload preview asset**
5. Select an image/video file
6. ✅ Should upload successfully!

---

## 🐛 IF IT STILL DOESN'T WORK

1. Make sure you're logged in as admin (email: krrishyogi18@gmail.com)
2. Check you ran the `make-admin.sql` to make yourself admin
3. Clear your browser cache and hard refresh (Cmd+Shift+R)
4. Check browser console for any errors

---

## 📝 FILES INCLUDED

- `supabase-storage-setup.sql` - Storage bucket setup (PASTE THIS ONE)
- `verify-database.sql` - Complete verification script
- `make-admin.sql` - Make your email admin
- `supabase-schema.sql` - Full schema (already has everything)

---

## 🚀 QUICK COMMANDS

**Make yourself admin:**
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'krrishyogi18@gmail.com';
```

**Test course save:**
```sql
INSERT INTO public.courses (title, description, price, category)
VALUES ('Test Course', 'Testing save', 99, 'Test')
RETURNING *;
```

---

**Done! Your storage should now work.** 🎉
