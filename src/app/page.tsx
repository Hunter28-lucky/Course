import { Hero } from "@/components/landing/hero";
import { CourseCatalog } from "@/components/course/course-catalog";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Course } from "@/types";

export const revalidate = 60;

async function fetchCourses(): Promise<Course[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, title, description, price, thumbnail_url, category, rating, shopify_product_id, shopify_variant_id"
    )
    .order("rating", { ascending: false });

  if (error) {
    console.error("Unable to fetch courses", error);
    return [];
  }

  return ((data as Course[]) ?? []).map((course) => ({
    ...course,
    category: course.category ?? "General",
    rating: course.rating ?? 4.8,
  }));
}

export default async function HomePage() {
  const courses = await fetchCourses();

  return (
    <div className="space-y-16">
      <Hero />
      <CourseCatalog courses={courses} isLoading={false} />
    </div>
  );
}
