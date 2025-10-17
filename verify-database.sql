-- ============================================
-- COMPLETE DATABASE VERIFICATION AND FIX
-- Run this in Supabase SQL Editor to verify everything is set up correctly
-- ============================================

-- 1. Verify all tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'courses', 'lessons', 'purchases', 'progress') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'courses', 'lessons', 'purchases', 'progress')
ORDER BY table_name;

-- 2. Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'courses', 'lessons', 'purchases', 'progress')
ORDER BY tablename;

-- 3. Check if you have admin access (replace with your email)
SELECT 
  id,
  email,
  full_name,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ ADMIN ACCESS'
    ELSE '❌ NOT ADMIN'
  END as access_level
FROM public.profiles
WHERE email = 'krrishyogi18@gmail.com';

-- 4. Verify storage bucket exists
SELECT 
  id,
  name,
  public,
  CASE 
    WHEN public = true THEN '✅ PUBLIC ACCESS'
    ELSE '⚠️ PRIVATE'
  END as access
FROM storage.buckets
WHERE id = 'lesson-videos';

-- 5. List all RLS policies on tables
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN permissive = 't' THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END as type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. List all storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 7. Test course insertion (as admin)
-- Uncomment the lines below to test if you can insert a course
/*
INSERT INTO public.courses (title, description, price, category, rating)
VALUES ('Test Course', 'This is a test', 99, 'Testing', 4.5)
RETURNING id, title, 'Course inserted successfully!' as status;
*/

-- 8. Check for any errors in recent operations
SELECT 
  'If you see results here, tables and policies are working!' as message;
