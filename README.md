<div align="center">

![CourseCraft hero](./public/images/hero-dashboard.svg)

# CourseCraft

Premium React + Supabase course-selling platform with an Apple/Notion-inspired interface, buttery Framer Motion transitions, PWA installability, and full role-based dashboards.

</div>

## ✨ What’s Inside

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 with design tokens tuned for 90+ Lighthouse performance
- Supabase database, authentication, storage, and Row Level Security-ready API helpers (client + server)
- Role-based auth flow with reusable context, route protection, and redirect rules
- Student dashboard with progress analytics, resume-last-lesson, and offline video caching
- Admin control center for managing courses, lessons, uploads, and monitoring revenue/enrollments
- Framer Motion transitions, responsive cards, skeleton loaders, and dark/light theming via `next-themes`
- Installable Progressive Web App (manifest + service worker + custom “Add to Home Screen” prompt)

## 🚀 Quick Start

1. **Install dependencies**

	 ```bash
	 npm install
	 ```

2. **Configure environment variables** in `.env.local` (already scaffolded):

	 ```env
	 SUPABASE_URL=...            # service role for admin scripts if needed
	 SUPABASE_ANON_KEY=...
	 NEXT_PUBLIC_SUPABASE_URL=...
	 NEXT_PUBLIC_SUPABASE_ANON_KEY=...
	 # Optional: enable Shopify embedding / sync
	 SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
	 SHOPIFY_STOREFRONT_ACCESS_TOKEN=
	 SHOPIFY_ADMIN_ACCESS_TOKEN=
	 SHOPIFY_WEBHOOK_SECRET=
	 SHOPIFY_APP_URL=https://your-app-url
	 ```

3. **Run the app locally**

	 ```bash
	 npm run dev
	 ```

	 Visit [http://localhost:3000](http://localhost:3000). Add the site to your home screen to test the PWA shell.

4. **Lint & type-check**

	 ```bash
	 npm run lint
	 ```

## � Shopify Compatibility

- The app can run fully standalone on Vercel/Supabase **or** embed inside a Shopify store as a headless front-end.
- Set the optional Shopify environment variables and redeploy to enable the integration layer.
- Features when enabled:
	- One-click sync from the admin dashboard to create/update Shopify products for each course
	- Webhook endpoint at `/api/shopify/webhooks` keeps Supabase courses in sync with Shopify product changes
	- Storefront API client available via `lib/shopify.ts` for fetching products or exposing the course catalog inside Shopify templates
- If the env vars are missing the UI automatically hides Shopify controls, so you can freely host the site outside Shopify.

## �🗄️ Supabase Schema

Create these tables and policies (SQL simplified for reference):

```sql
create table public.profiles (
	id uuid primary key references auth.users on delete cascade,
	email text not null unique,
	full_name text,
	avatar_url text,
	role text not null default 'student' check (role in ('student','admin')),
	created_at timestamptz default now()
);

create table public.courses (
	id uuid primary key default gen_random_uuid(),
	title text not null,
	description text not null,
	price integer not null,
	thumbnail_url text,
	category text default 'General',
	rating numeric default 4.8,
	shopify_product_id text unique,
	shopify_variant_id text unique,
	created_at timestamptz default now()
);

create table public.lessons (
	id uuid primary key default gen_random_uuid(),
	course_id uuid references public.courses on delete cascade,
	title text not null,
	video_url text not null,
	"order" integer default 1,
	created_at timestamptz default now()
);

create table public.purchases (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references public.profiles on delete cascade,
	course_id uuid references public.courses on delete cascade,
	created_at timestamptz default now()
);

create table public.progress (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references public.profiles on delete cascade,
	lesson_id uuid references public.lessons on delete cascade,
	completed boolean default false,
	updated_at timestamptz default now()
);

create index on public.courses (category);
create index on public.courses (created_at desc);
create index on public.courses (shopify_product_id);
create index on public.lessons (course_id, "order");
create index on public.purchases (user_id, course_id);
create index on public.progress (user_id, lesson_id);
```

Enable RLS and add policies such as:

- profiles: users can `select/update` their row; admins can manage all
- courses/lessons: admins can manage; students read only
- purchases/progress: owners read/write their own data

See `src/lib/supabase-client.ts` and `src/lib/supabase-server.ts` for shared client helpers.

## 🧪 User Flows

- **Public catalog** → browse, filter, view course details, preview locked lessons
- **Auth** → email/password registration, automatic profile provisioning, toast feedback
- **Student dashboard** → progress bars, “resume lesson”, offline caching of last video
- **Admin dashboard** → create/update/delete courses, upload lesson assets, manage lessons, view mock revenue metrics

## 📱 PWA + Offline

- `public/manifest.json` & SVG icons provide install prompts on iOS/Android
- `public/service-worker.js` caches shell assets + videos (cache-first for media)
- Custom `<PWAInstallPrompt />` surfaces the `beforeinstallprompt` event
- `useRegisterServiceWorker` hook registers and refreshes the SW from any client route

## 📦 Deployment

- **Frontend** → Vercel (`next.config.ts` set to `output: "standalone"` for smooth deploys)
- **Backend** → Supabase project for Postgres, Auth, Storage, Policies
- Provision a `lesson-videos` storage bucket and enable public access or signed URLs depending on your compliance requirements
- Configure environment secrets (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY` if background jobs are needed)

## 🔍 Analytics & Extensions

- Hook in your analytics provider (e.g., Vercel Web Analytics, PostHog) inside `AppProviders`
- Extend React Query usage for data-heavy dashboards or optimistic updates
- Swap mock payment flow with a real provider (Stripe Checkout, LemonSqueezy, etc.) when ready

## 🤝 Contributing

1. Fork & clone the repository
2. `npm install`
3. Create a feature branch
4. Submit a PR with screenshots + schema changes if any

Enjoy building premium learning experiences with CourseCraft! ✨
