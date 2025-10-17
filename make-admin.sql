-- Make krrishyogi18@gmail.com an admin user
-- Run this in Supabase SQL Editor after confirming your email

-- Update the user's role to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'krrishyogi18@gmail.com';

-- Verify the change
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE email = 'krrishyogi18@gmail.com';
