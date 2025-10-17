export type Role = "admin" | "student";

export type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
  category: string;
  rating: number;
  shopify_product_id?: string | null;
  shopify_variant_id?: string | null;
  created_at?: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  order: number;
  created_at?: string;
};

export type Purchase = {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  user?: Profile;
  course?: Course;
};

export type Progress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  updated_at: string;
  lesson?: Lesson;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at?: string;
};
