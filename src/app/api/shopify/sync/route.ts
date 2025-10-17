import { NextResponse } from "next/server";
import { isShopifyEnabled } from "@/lib/env-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { removeCourseFromShopify, syncCourseToShopify } from "@/lib/shopify";
import type { Course } from "@/types";

const fetchCourse = async (courseId: string) => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, title, description, price, thumbnail_url, category, rating, shopify_product_id, shopify_variant_id",
    )
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Course not found");
  }

  return data as Course;
};

export async function POST(request: Request) {
  if (!isShopifyEnabled()) {
    return NextResponse.json(
      { error: "Shopify integration is not configured" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const courseId = body?.courseId as string | undefined;

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  try {
    const course = await fetchCourse(courseId);
    const result = await syncCourseToShopify(course);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Shopify sync failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isShopifyEnabled()) {
    return NextResponse.json(
      { error: "Shopify integration is not configured" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const course = await fetchCourse(courseId);
    await removeCourseFromShopify(course);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Shopify unlink failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unlink failed" },
      { status: 500 },
    );
  }
}
