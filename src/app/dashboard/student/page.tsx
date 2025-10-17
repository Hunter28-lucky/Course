import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StudentCourses } from "@/components/dashboard/student-courses";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Course, Lesson, Progress } from "@/types";

export const dynamic = "force-dynamic";

type StudentCourseCard = {
  id: string;
  course: Course;
  progress: number;
  lastLesson: Lesson | null;
  purchasedAt: string;
};

export default async function StudentDashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select(
      "id, created_at, course_id, course:courses(id, title, description, price, thumbnail_url, category, rating, shopify_product_id, shopify_variant_id)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: progress } = await supabase
    .from("progress")
    .select(
      "lesson_id, completed, updated_at, lesson:lessons(course_id, order, title, video_url)"
    )
    .eq("user_id", user.id);

  const courses = ((purchases ?? [])
    .map((purchase) => {
    const rawCourse = purchase.course as Course | Course[] | null;
    if (!rawCourse || (Array.isArray(rawCourse) && rawCourse.length === 0)) {
      return null;
    }
      const course = Array.isArray(rawCourse)
        ? {
            ...(rawCourse[0] as Course),
            category: (rawCourse[0] as Course)?.category ?? "General",
            rating: (rawCourse[0] as Course)?.rating ?? 4.8,
          }
        : {
            ...(rawCourse as Course),
            category: (rawCourse as Course)?.category ?? "General",
            rating: (rawCourse as Course)?.rating ?? 4.8,
          };

      if (!course) {
        return null;
      }

      const lessonsForCourse = (progress ?? [])
        .map((item) => {
          const rawLesson = item.lesson as unknown as Lesson | Lesson[] | null;
          const lesson = Array.isArray(rawLesson)
            ? (rawLesson[0] as Lesson)
            : (rawLesson as Lesson | null);

          if (!lesson || lesson.course_id !== course.id) {
            return null;
          }

          return {
            ...item,
            lesson,
          };
        })
        .filter(Boolean) as Array<
        Progress & {
          lesson: Lesson;
        }
      >;

      const percentage = (() => {
        if (!lessonsForCourse.length) return 0;
        const completedCount = lessonsForCourse.filter((item) => item.completed)
          .length;
        return Math.round((completedCount / lessonsForCourse.length) * 100);
      })();

      const lastWatched = lessonsForCourse
        .slice()
        .sort((a, b) =>
          (b.updated_at ?? "").localeCompare(a.updated_at ?? "")
        )[0]?.lesson ?? null;

      return {
        id: purchase.id,
        course,
        progress: percentage,
        lastLesson: lastWatched,
        purchasedAt: purchase.created_at,
      };
    })
    .filter(Boolean)) as StudentCourseCard[];

  return (
    <div className="space-y-10">
      <DashboardHeader
        title="Student dashboard"
        subtitle="Your enrolled courses"
      />
      <StudentCourses courses={courses} />
    </div>
  );
}
