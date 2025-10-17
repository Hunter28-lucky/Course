-- ============================================
-- STORAGE BUCKET AND POLICIES SETUP
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Step 1: Create the storage bucket for lesson videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-videos', 'lesson-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view videos" ON storage.objects;

-- Step 4: Create storage policies

-- Allow everyone (authenticated users) to view lesson videos
CREATE POLICY "Anyone can view lesson videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-videos');

-- Allow admins to upload lesson videos
CREATE POLICY "Admins can upload lesson videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update lesson videos
CREATE POLICY "Admins can update lesson videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete lesson videos
CREATE POLICY "Admins can delete lesson videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-videos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Step 5: Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'lesson-videos';

-- Step 6: Verify the policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
