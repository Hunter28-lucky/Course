import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Course, Lesson, Purchase } from "@/types";
import { isShopifyEnabled } from "@/lib/env-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
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

  if (profile?.role !== "admin") {
    redirect("/dashboard/student");
  }

  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id, title, description, price, thumbnail_url, category, rating, shopify_product_id, shopify_variant_id, created_at"
    )
    .order("created_at", { ascending: false });

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, course_id, title, video_url, order, created_at")
    .order("order", { ascending: true });

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, user_id, course_id, created_at")
    .order("created_at", { ascending: false });

  const shopifyEnabled = isShopifyEnabled();

  return (
    <div className="space-y-10">
      <DashboardHeader
        title="Admin control center"
        subtitle="Manage courses, content, and enrollment"
      />
      <AdminDashboard
        courses={((courses as Course[]) ?? []).map((course) => ({
          ...course,
          category: course.category ?? "General",
          rating: course.rating ?? 4.8,
        }))}
        lessons={(lessons as Lesson[]) ?? []}
        purchases={(purchases as Purchase[]) ?? []}
        shopifyEnabled={shopifyEnabled}
      />
    </div>
  );
}
