-- CourseCraft Database Schema
-- Production-ready Supabase schema with RLS policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);

-- RLS Policies for profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- COURSES TABLE
-- ============================================
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  price integer not null check (price >= 0),
  thumbnail_url text,
  category text not null default 'General',
  rating numeric(3, 2) default 4.80 check (rating >= 0 and rating <= 5),
  shopify_product_id text unique,
  shopify_variant_id text unique,
  created_at timestamptz default now()
);

-- RLS Policies for courses
alter table public.courses enable row level security;

create policy "Anyone can view courses"
  on public.courses for select
  to authenticated
  using (true);

create policy "Admins can insert courses"
  on public.courses for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update courses"
  on public.courses for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete courses"
  on public.courses for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- LESSONS TABLE
-- ============================================
create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses on delete cascade,
  title text not null,
  video_url text not null,
  "order" integer not null default 1 check ("order" > 0),
  created_at timestamptz default now()
);

-- RLS Policies for lessons
alter table public.lessons enable row level security;

create policy "Anyone can view lessons"
  on public.lessons for select
  to authenticated
  using (true);

create policy "Admins can insert lessons"
  on public.lessons for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update lessons"
  on public.lessons for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete lessons"
  on public.lessons for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- PURCHASES TABLE
-- ============================================
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, course_id)
);

-- RLS Policies for purchases
alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Users can create their own purchases"
  on public.purchases for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all purchases"
  on public.purchases for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- PROGRESS TABLE
-- ============================================
create table public.progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  lesson_id uuid not null references public.lessons on delete cascade,
  completed boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- RLS Policies for progress
alter table public.progress enable row level security;

create policy "Users can view their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.progress for update
  using (auth.uid() = user_id);

create policy "Admins can view all progress"
  on public.progress for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index idx_courses_category on public.courses (category);
create index idx_courses_created_at on public.courses (created_at desc);
create index idx_courses_rating on public.courses (rating desc);
create index idx_courses_shopify_product on public.courses (shopify_product_id);
create index idx_lessons_course_id on public.lessons (course_id, "order");
create index idx_purchases_user_id on public.purchases (user_id);
create index idx_purchases_course_id on public.purchases (course_id);
create index idx_purchases_created_at on public.purchases (created_at desc);
create index idx_progress_user_id on public.progress (user_id);
create index idx_progress_lesson_id on public.progress (lesson_id);
create index idx_progress_completed on public.progress (completed);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp on progress
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_progress_updated_at
  before update on public.progress
  for each row
  execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Insert demo admin user (update with your auth.users id after signup)
-- insert into public.profiles (id, email, full_name, role)
-- values (
--   'YOUR_AUTH_USER_ID_HERE'::uuid,
--   'admin@coursecraft.dev',
--   'Admin User',
--   'admin'
-- );

-- Insert demo courses
insert into public.courses (title, description, price, category, rating, thumbnail_url) values
  ('React Mastery 2025', 'Master modern React patterns including Server Components, Suspense, and advanced hooks. Build production-ready applications with confidence.', 299, 'Development', 4.9, null),
  ('Design Systems at Scale', 'Learn how to architect, build, and maintain design systems that empower teams to ship consistent, accessible experiences.', 399, 'Design', 4.8, null),
  ('TypeScript Deep Dive', 'Go beyond the basics. Master advanced types, generics, conditional types, and build type-safe architectures.', 249, 'Development', 4.7, null),
  ('Motion Design Essentials', 'Craft buttery-smooth animations with Framer Motion. Learn physics-based interactions and micro-interactions.', 199, 'Design', 4.9, null);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create storage bucket for lesson videos (run this in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('lesson-videos', 'lesson-videos', true);

-- Storage policies for lesson-videos bucket
-- create policy "Anyone can view lesson videos"
--   on storage.objects for select
--   using (bucket_id = 'lesson-videos');

-- create policy "Admins can upload lesson videos"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'lesson-videos' and
--     exists (
--       select 1 from public.profiles
--       where id = auth.uid() and role = 'admin'
--     )
--   );

-- create policy "Admins can update lesson videos"
--   on storage.objects for update
--   using (
--     bucket_id = 'lesson-videos' and
--     exists (
--       select 1 from public.profiles
--       where id = auth.uid() and role = 'admin'
--     )
--   );

-- create policy "Admins can delete lesson videos"
--   on storage.objects for delete
--   using (
--     bucket_id = 'lesson-videos' and
--     exists (
--       select 1 from public.profiles
--       where id = auth.uid() and role = 'admin'
--     )
--   );
