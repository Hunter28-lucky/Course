# 🚀 CourseCraft Deployment Guide

This guide walks you through deploying your production-ready course platform to Vercel + Supabase.

---

## 📋 Prerequisites

- [Supabase account](https://supabase.com) (free tier works)
- [Vercel account](https://vercel.com) (free tier works)
- Git repository (GitHub/GitLab/Bitbucket)

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create a New Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name**: `coursecraft-prod` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for provisioning

### 1.2 Run the Schema Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this repo
4. Paste into the editor
5. Click **Run** (bottom-right)
6. Verify success: Check **Table Editor** → you should see `profiles`, `courses`, `lessons`, `purchases`, `progress`

### 1.3 Create Storage Bucket for Videos

1. Go to **Storage** in Supabase sidebar
2. Click **New Bucket**
3. **Name**: `lesson-videos`
4. **Public**: ✅ Enabled (or use signed URLs if you prefer)
5. Click **Create Bucket**

### 1.4 Configure Storage Policies

In **SQL Editor**, run:

```sql
-- Allow authenticated users to view videos
create policy "Anyone can view lesson videos"
  on storage.objects for select
  using (bucket_id = 'lesson-videos');

-- Allow admins to upload
create policy "Admins can upload lesson videos"
  on storage.objects for insert
  with check (
    bucket_id = 'lesson-videos' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow admins to delete
create policy "Admins can delete lesson videos"
  on storage.objects for delete
  using (
    bucket_id = 'lesson-videos' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

### 1.5 Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://yourproject.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long JWT token)
   - **service_role key** (optional, for admin scripts only)

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Push Code to Git

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial CourseCraft commit"

# Push to GitHub (example)
git remote add origin https://github.com/yourusername/coursecraft.git
git branch -M main
git push -u origin main
```

### 2.2 Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → Select your repo
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: `./` (default)
5. Click **Environment Variables** dropdown

### 2.3 Add Environment Variables

Add these four variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yourproject.supabase.co` | From Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | From Supabase API settings (anon key) |
| `SUPABASE_URL` | `https://yourproject.supabase.co` | Same as public URL |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Same as public anon key |

6. Click **Deploy**

### 2.4 Wait for Build

- First build takes ~2-3 minutes
- Vercel will run `npm install` → `npm run build` → deploy
- Watch the build logs for any issues

### 2.5 Visit Your Live Site

Once deployed, you'll get a URL like:
- `https://coursecraft-xyz123.vercel.app`

Click to open and verify the site loads!

---

## 👤 Step 3: Create Your Admin User

### 3.1 Sign Up via the UI

1. Visit your deployed site: `https://your-site.vercel.app/auth/register`
2. Fill in:
   - **Full Name**: Your Name
   - **Email**: `admin@yourdomain.com`
   - **Password**: Strong password (min 8 chars)
3. Click **Create Account**
4. Check your email inbox for Supabase confirmation link
5. Click the link to verify your account

### 3.2 Promote User to Admin

1. Go back to **Supabase Dashboard** → **Table Editor** → `profiles`
2. Find your newly created profile row (search by email)
3. Click the row to edit
4. Change `role` from `student` → `admin`
5. Click **Save**

### 3.3 Log Out & Log Back In

1. On your site, click **Sign Out**
2. Go to `/auth/login`
3. Sign in with your admin credentials
4. You should now see **Admin** in the navbar and access to `/dashboard/admin`

---

## 🎨 Step 4: Add Your First Course

### 4.1 Navigate to Admin Dashboard

- URL: `https://your-site.vercel.app/dashboard/admin`

### 4.2 Create a Course

1. Click **New Course** button
2. Fill in:
   - **Title**: "React Mastery 2025"
   - **Description**: "Master modern React patterns..."
   - **Price**: 299
   - **Category**: "Development"
   - **Thumbnail URL**: (optional, or upload later)
3. Click **Save Course**

### 4.3 Add Lessons

1. With the course selected, scroll down to **Add Lesson** form
2. Fill in:
   - **Lesson Title**: "Introduction to React Server Components"
   - **Video URL**: Paste a public video URL (YouTube embed, Vimeo, or Supabase Storage URL)
   - **Order**: 1
3. Click **Add Lesson**
4. Repeat for more lessons (order 2, 3, etc.)

### 4.4 Upload Thumbnail (Optional)

- Use the **Upload preview asset** button
- Select an image/video file
- It will upload to Supabase Storage and auto-populate the thumbnail URL

---

## 📱 Step 5: Test PWA Install

### 5.1 Desktop (Chrome/Edge)

1. Visit your site
2. Look for **install prompt** banner at bottom-right (after ~1 second)
3. Click **Install**
4. App opens in standalone window
5. Check **Application** tab in DevTools → **Manifest** and **Service Workers**

### 5.2 Mobile (iOS Safari)

1. Open your site in Safari
2. Tap **Share** button
3. Scroll down → **Add to Home Screen**
4. Tap **Add**
5. Icon appears on home screen
6. Tap to launch as standalone app

### 5.3 Mobile (Android Chrome)

1. Open your site in Chrome
2. Look for **Add to Home Screen** banner
3. Tap **Install** or use browser menu → **Install App**
4. App appears in app drawer

---

## ✅ Step 6: Verify Everything Works

### Student Flow

1. Open an incognito/private window
2. Go to `/auth/register`
3. Create a student account (different email)
4. Verify email
5. Log in → should redirect to `/dashboard/student`
6. Go to home (`/`) → click on a course
7. Click **Buy Course** → purchase should complete
8. Return to `/dashboard/student` → see progress bar
9. Click **Resume** → video player loads
10. Mark a lesson complete → progress updates

### Admin Flow

1. Log in as admin
2. Go to `/dashboard/admin`
3. See stats: courses, students, revenue
4. Edit a course → change price
5. Add a new lesson
6. Delete a test course
7. View **Purchases** list

---

## 🔍 Troubleshooting

### Issue: "Unable to fetch courses"

- **Check**: Supabase RLS policies are enabled
- **Fix**: Re-run the schema SQL in Supabase SQL Editor

### Issue: "Authentication error"

- **Check**: Environment variables are set correctly in Vercel
- **Fix**: Settings → Environment Variables → Add missing keys → Redeploy

### Issue: Video upload fails

- **Check**: Storage bucket `lesson-videos` exists
- **Fix**: Create bucket in Supabase Storage + add policies

### Issue: PWA doesn't install

- **Check**: Site is served over HTTPS (Vercel auto-provides)
- **Check**: `manifest.json` and `service-worker.js` are accessible
- **Fix**: Clear cache, reload, try again

### Issue: Build fails on Vercel

- **Check**: Lint errors in logs
- **Fix**: Run `npm run lint` locally, fix errors, commit, redeploy

---

## 🎯 Post-Launch Checklist

- [ ] Update `metadataBase` in `src/app/layout.tsx` with your real domain
- [ ] Replace placeholder OpenGraph image URL in layout metadata
- [ ] Configure custom domain in Vercel (Settings → Domains)
- [ ] Set up Vercel Analytics (optional, free tier)
- [ ] Enable Supabase Edge Functions (optional, for webhooks)
- [ ] Integrate real payment gateway (Stripe, LemonSqueezy)
- [ ] Add email notifications (Resend, SendGrid)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Run Lighthouse audit → aim for 90+ scores
- [ ] Test on real devices (iOS, Android)
- [ ] Create backup/restore strategy for Supabase data

---

## 🚀 Performance Tips

- **Images**: Use Next.js `<Image />` with `priority` for above-fold content
- **Videos**: Compress with HandBrake or FFmpeg before uploading
- **Caching**: Service worker caches videos automatically
- **CDN**: Vercel Edge Network handles global distribution
- **Database**: Add more indexes if queries slow down (check Supabase SQL logs)

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**🎉 Congratulations!** Your premium course platform is live and ready to onboard students!

Need help? Open an issue in the repo or consult the README.md for code architecture details.
