import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/course/course-player";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Course, Lesson, Progress } from "@/types";

export const revalidate = 30;

async function getCourse(courseId: string) {
  const supabase = await getSupabaseServerClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(
      "id, title, description, price, thumbnail_url, category, rating, shopify_product_id, shopify_variant_id"
    )
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    console.error(courseError);
    return null;
  }

  if (!course) {
    return null;
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, course_id, title, video_url, order")
    .eq("course_id", courseId)
    .order("order", { ascending: true });

  if (lessonsError) {
    console.error(lessonsError);
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let purchased = false;
  let progress: Progress[] = [];

  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    purchased = Boolean(purchase);

    if (purchase) {
      const { data: progressData } = await supabase
        .from("progress")
        .select("id, user_id, lesson_id, completed, updated_at")
        .eq("user_id", user.id)
        .in(
          "lesson_id",
          (lessons ?? []).map((lesson) => lesson.id)
        );

      progress = (progressData as Progress[]) ?? [];
    }
  }

  return {
    course: {
      ...(course as Course),
      category: (course as Course).category ?? "General",
      rating: (course as Course).rating ?? 4.8,
    },
    lessons: (lessons as Lesson[]) ?? [],
    purchased,
    progress,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { courseId: string };
}): Promise<Metadata> {
  const data = await getCourse(params.courseId);

  if (!data?.course) {
    return {
      title: "Course not found",
    };
  }

  return {
    title: data.course.title,
    description: data.course.description,
    openGraph: {
      title: data.course.title,
      description: data.course.description,
      images: data.course.thumbnail_url
        ? [
            {
              url: data.course.thumbnail_url,
              width: 1200,
              height: 630,
              alt: data.course.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const data = await getCourse(params.courseId);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <CoursePlayer
        course={data.course}
        lessons={data.lessons}
        purchased={data.purchased}
        initialProgress={data.progress}
      />
    </div>
  );
}
