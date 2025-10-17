# 🔧 STORAGE BUCKET SETUP - DASHBOARD METHOD

## ⚠️ You got error "must be owner of table objects"?
This is normal! Storage buckets can't be created via SQL directly. Use the Dashboard UI instead.

---

## 📋 STEP-BY-STEP INSTRUCTIONS (Using Dashboard)

### Step 1: Create Storage Bucket

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New Bucket** button
5. Fill in:
   - **Name**: `lesson-videos`
   - **Public bucket**: ✅ Check this box (IMPORTANT!)
   - **File size limit**: Leave default or set to 100MB
   - **Allowed MIME types**: Leave empty (allows all)
6. Click **Create bucket**

### Step 2: Set Up Storage Policies

1. In **Storage** → Click on the **lesson-videos** bucket you just created
2. Click the **Policies** tab (top of the page)
3. You'll see "No policies created yet"
4. Click **New Policy** button

#### Policy 1: Anyone can view videos
1. Click **Create policy**
2. Choose **"For full customization"** → **Get started**
3. Fill in:
   - **Policy name**: `Anyone can view lesson videos`
   - **Allowed operation**: Check **SELECT** only
   - **Target roles**: `public` (or leave default)
   - **USING expression**: Paste this:
   ```sql
   bucket_id = 'lesson-videos'
   ```
4. Click **Review** → **Save policy**

#### Policy 2: Admins can upload
1. Click **New Policy** again
2. Choose **"For full customization"** → **Get started**
3. Fill in:
   - **Policy name**: `Admins can upload lesson videos`
   - **Allowed operation**: Check **INSERT** only
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**: Paste this:
   ```sql
   bucket_id = 'lesson-videos' AND
   EXISTS (
     SELECT 1 FROM public.profiles
     WHERE id = auth.uid() AND role = 'admin'
   )
   ```
4. Click **Review** → **Save policy**

#### Policy 3: Admins can update
1. Click **New Policy** again
2. Choose **"For full customization"** → **Get started**
3. Fill in:
   - **Policy name**: `Admins can update lesson videos`
   - **Allowed operation**: Check **UPDATE** only
   - **Target roles**: `authenticated`
   - **USING expression**: Paste this:
   ```sql
   bucket_id = 'lesson-videos' AND
   EXISTS (
     SELECT 1 FROM public.profiles
     WHERE id = auth.uid() AND role = 'admin'
   )
   ```
4. Click **Review** → **Save policy**

#### Policy 4: Admins can delete
1. Click **New Policy** again
2. Choose **"For full customization"** → **Get started**
3. Fill in:
   - **Policy name**: `Admins can delete lesson videos`
   - **Allowed operation**: Check **DELETE** only
   - **Target roles**: `authenticated`
   - **USING expression**: Paste this:
   ```sql
   bucket_id = 'lesson-videos' AND
   EXISTS (
     SELECT 1 FROM public.profiles
     WHERE id = auth.uid() AND role = 'admin'
   )
   ```
4. Click **Review** → **Save policy**

---

## ✅ VERIFY IT WORKED

Go back to **Storage** → **lesson-videos** bucket:
- You should see 4 policies listed
- Bucket should show as **Public**
- Try uploading a test file manually to verify

---

## 🎯 NOW TEST IN YOUR APP

1. Clear browser cache (Cmd+Shift+R)
2. Go to: `https://course-topaz-one.vercel.app/dashboard/admin`
3. Sign in as admin (krrishyogi18@gmail.com)
4. Create/select a course
5. Click **Save course**
6. Click **Upload preview asset**
7. Select a file
8. ✅ Should upload successfully!

---

## 🐛 TROUBLESHOOTING

**If upload still fails:**

1. **Check you're admin**: Run this SQL in SQL Editor:
   ```sql
   SELECT email, role FROM public.profiles WHERE email = 'krrishyogi18@gmail.com';
   ```
   Should show `role = 'admin'`

2. **Check bucket is public**: In Storage → lesson-videos → Settings → Should say "Public bucket"

3. **Check policies exist**: In Storage → lesson-videos → Policies → Should show 4 policies

4. **Browser console**: Open DevTools → Console → Look for any error messages

5. **Try manual upload**: In Supabase Storage UI, try uploading a file to test

---

## 📝 ALTERNATIVE: Quick Policy Templates

Instead of "For full customization", you can try:
1. Select **"Enable read access for all users"** template
2. Then modify for admin-only writes

But the custom method above gives you full control.

---

**This Dashboard method always works!** No SQL permission errors. 🎉
