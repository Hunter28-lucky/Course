# ⚡ Quick Setup Guide

## 🎯 You're Almost Ready!

The app is running at **http://localhost:3000** but you'll see "Unable to fetch courses" because the Supabase connection needs to be configured.

---

## 📝 Next Steps (5 minutes)

### Option A: Use Your Real Supabase Project (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Name it, set region, create password
   - Wait 2 minutes for provisioning

2. **Get Your Keys**
   - Go to Project Settings → API
   - Copy:
     - Project URL: `https://yourproject.supabase.co`
     - anon/public key: `eyJhbGc...` (long JWT)

3. **Update `.env.local`**
   
   Replace the placeholder values:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_URL=https://yourproject.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Run the Database Schema**
   - In Supabase dashboard, go to SQL Editor
   - Click "New Query"
   - Copy all content from `supabase-schema.sql`
   - Paste and click "Run"
   - ✅ Verify: Check Table Editor → should see 5 tables

5. **Restart Dev Server**
   - Press `Ctrl+C` in terminal
   - Run `npm run dev` again
   - Visit http://localhost:3000
   - ✅ Homepage should load with empty catalog

6. **Create Admin Account**
   - Go to http://localhost:3000/auth/register
   - Sign up with your email
   - Check email for confirmation link
   - In Supabase dashboard → Table Editor → `profiles`
   - Find your row, change `role` from `student` to `admin`
   - Log out and log back in
   - ✅ You should see "Admin" in navbar

7. **Add Your First Course**
   - Go to http://localhost:3000/dashboard/admin
   - Click "New Course"
   - Fill in details, save
   - Add lessons with video URLs
   - ✅ Course appears on homepage

---

### Option B: Mock Data Mode (Quick Test)

Want to see the UI without setting up Supabase? Uncomment mock data in:

`src/app/page.tsx`:
```typescript
// For quick demo without Supabase
const mockCourses: Course[] = [
  {
    id: "1",
    title: "React Mastery 2025",
    description: "Master modern React patterns...",
    price: 299,
    category: "Development",
    rating: 4.9,
    thumbnail_url: null,
  },
  // Add more...
];

// Replace: const courses = await fetchCourses();
const courses = mockCourses;
```

Then restart the server.

---

## 🚀 Deploy When Ready

Once you've tested locally, follow **DEPLOYMENT.md** for:
- Vercel deployment
- Production Supabase setup
- PWA testing
- Performance optimization

---

## 🛒 Enable Shopify Mode (Optional)

1. **Create a Shopify custom app**
   - In the Shopify admin, visit `Settings → Apps and sales channels`
   - Click **Develop apps** → **Create an app** (requires partner permissions)
   - Enable the **Storefront API** and grant `read_products`
   - Enable the **Admin API** with `read_products` and `write_products`
   - Generate Admin API access token, Storefront access token, and webhook secret

2. **Populate the Shopify env vars**

   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
   SHOPIFY_ADMIN_ACCESS_TOKEN=...
   SHOPIFY_WEBHOOK_SECRET=...
   SHOPIFY_APP_URL=https://your-vercel-app-url
   ```

3. **Register webhooks** (Products create/update/delete → `https://your-app-url/api/shopify/webhooks`)

4. Redeploy. The admin dashboard will now show **Sync to Shopify** actions and course changes will mirror products. If env vars are removed, the UI automatically hides Shopify controls so you can continue to host the site standalone.

---

## ❓ Common Issues

### "Invalid API key"
- **Fix**: Update `.env.local` with real Supabase keys
- Restart dev server (`Ctrl+C` → `npm run dev`)

### "Unable to fetch courses"
- **Fix**: Run `supabase-schema.sql` in Supabase SQL Editor
- Check RLS policies are enabled

### Port 3000 in use
- **Fix**: Kill existing process or use different port:
  ```bash
  PORT=3001 npm run dev
  ```

### TypeScript errors
- **Fix**: Run `npm run lint` and fix issues
- Check all imports match file names

---

## 📚 Documentation

- **README.md** → Project overview, tech stack
- **DEPLOYMENT.md** → Step-by-step production deployment
- **PROJECT_SUMMARY.md** → Complete feature list
- **supabase-schema.sql** → Database setup

---

## 🎉 You're All Set!

Your premium course platform is ready to customize and deploy. Happy building! ✨

**Questions?** Check the docs or open an issue on GitHub.
