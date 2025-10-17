"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Plus, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Course, Lesson, Purchase } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { toast } from "react-hot-toast";

const EMPTY_COURSE = {
  title: "",
  description: "",
  price: 199,
  thumbnail_url: "",
  category: "",
  rating: 4.8,
};

type CourseForm = typeof EMPTY_COURSE;

type AdminDashboardProps = {
  courses: Course[];
  lessons: Lesson[];
  purchases: Purchase[];
  shopifyEnabled: boolean;
};

export const AdminDashboard = ({
  courses,
  lessons,
  purchases,
  shopifyEnabled,
}: AdminDashboardProps) => {
  const { supabase } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedCourseId, setSelectedCourseId] = useState<string | "new">(
    courses[0]?.id ?? "new",
  );

  const [courseForm, setCourseForm] = useState<CourseForm>(() =>
    courses[0]
      ? {
          title: courses[0].title,
          description: courses[0].description,
          price: courses[0].price,
          thumbnail_url: courses[0].thumbnail_url ?? "",
          category: courses[0].category,
          rating: courses[0].rating,
        }
      : EMPTY_COURSE,
  );

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const lessonsForCourse = useMemo(
    () => lessons.filter((lesson) => lesson.course_id === selectedCourse?.id),
    [lessons, selectedCourse?.id],
  );

  const stats = useMemo(() => {
    const revenue = purchases.reduce((sum, purchase) => {
      const course = courses.find((item) => item.id === purchase.course_id);
      return sum + (course?.price ?? 0);
    }, 0);

    const students = new Set(purchases.map((item) => item.user_id)).size;

    return {
      totalCourses: courses.length,
      totalStudents: students,
      totalRevenue: revenue,
    };
  }, [courses, purchases]);

  const resetFormForCourse = (course?: Course | null) => {
    if (!course) {
      setCourseForm(EMPTY_COURSE);
      return;
    }

    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      thumbnail_url: course.thumbnail_url ?? "",
      category: course.category,
      rating: course.rating,
    });
  };

  const updateCourseForm = (id: string | "new") => {
    setSelectedCourseId(id);
    if (id === "new") {
      resetFormForCourse(null);
      return;
    }

    const course = courses.find((item) => item.id === id) ?? null;
    resetFormForCourse(course);
  };

  const handleSaveCourse = async () => {
    try {
      if (selectedCourseId === "new") {
        const { data, error } = await supabase
          .from("courses")
          .insert({
            ...courseForm,
          })
          .select()
          .single();
        if (error) throw error;
        
        // Update the selected course ID to the newly created course
        if (data) {
          setSelectedCourseId(data.id);
        }
        toast.success("Course created");
      } else {
        const { error } = await supabase
          .from("courses")
          .update({
            ...courseForm,
          })
          .eq("id", selectedCourseId);
        if (error) throw error;
        toast.success("Course updated");
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to save course");
    }
  };

  const handleDeleteCourse = async () => {
    if (selectedCourseId === "new") return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", selectedCourseId);
      if (error) throw error;
      toast.success("Course deleted");
      setSelectedCourseId("new");
      resetFormForCourse(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete course");
    }
  };

  const handleAddLesson = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourse) {
      toast.error("Select a course first");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const order = Number(formData.get("order")) || lessonsForCourse.length + 1;

    try {
      const { error } = await supabase.from("lessons").insert({
        title,
        video_url: videoUrl,
        order,
        course_id: selectedCourse.id,
      });
      if (error) throw error;
      toast.success("Lesson created");
      event.currentTarget.reset();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to create lesson");
    }
  };

  const handleUploadVideo = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files?.length) {
      toast.error("Please select a file");
      return;
    }

    if (selectedCourseId === "new") {
      toast.error("Please save the course first before uploading assets");
      return;
    }

    const file = event.target.files[0];

    try {
      const path = `${selectedCourseId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("lesson-videos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw error;
      
      const {
        data: { publicUrl },
      } = supabase.storage.from("lesson-videos").getPublicUrl(data.path);
      
      setCourseForm((prev) => ({
        ...prev,
        thumbnail_url: publicUrl,
      }));
      toast.success("Asset uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Make sure the lesson-videos bucket exists in Supabase Storage.");
    }
  };

  const callShopifyEndpoint = async (method: "POST" | "DELETE") => {
    if (!selectedCourse) {
      toast.error("Save the course before syncing with Shopify");
      return;
    }

    try {
      const url =
        method === "POST"
          ? "/api/shopify/sync"
          : `/api/shopify/sync?courseId=${selectedCourse.id}`;

      const response = await fetch(url, {
        method,
        headers:
          method === "POST"
            ? { "Content-Type": "application/json" }
            : undefined,
        body:
          method === "POST"
            ? JSON.stringify({ courseId: selectedCourse.id })
            : undefined,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Shopify request failed");
      }

      toast.success(
        method === "POST"
          ? "Course synced to Shopify"
          : "Course disconnected from Shopify",
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      toast.error("Shopify sync failed");
    }
  };

  return (
    <div className="space-y-10">
      <div
        className={`grid gap-6 ${
          shopifyEnabled ? "sm:grid-cols-4" : "sm:grid-cols-3"
        }`}
      >
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
            Courses
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {stats.totalCourses}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
            Students
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {stats.totalStudents}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
            Revenue (mock)
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </Card>
        {shopifyEnabled && (
          <Card className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
              Shopify status
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {selectedCourse?.shopify_product_id ? "Linked" : "Not linked"}
            </p>
            {selectedCourse?.shopify_product_id && (
              <div className="space-y-1 text-xs text-foreground/40">
                <p>Product: {selectedCourse.shopify_product_id}</p>
                {selectedCourse.shopify_variant_id && (
                  <p>Variant: {selectedCourse.shopify_variant_id}</p>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      <Card className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
              Courses
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Manage catalog
            </h2>
          </div>
          <Button onClick={() => updateCourseForm("new")}>
            <Plus size={16} /> New course
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {courses.map((course) => (
            <Button
              key={course.id}
              variant={selectedCourseId === course.id ? "primary" : "ghost"}
              onClick={() => updateCourseForm(course.id)}
            >
              {course.title}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Input
              placeholder="Course title"
              value={courseForm.title}
              onChange={(event) =>
                setCourseForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
            />
            <Textarea
              placeholder="Describe what students will master"
              value={courseForm.description}
              onChange={(event) =>
                setCourseForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
            <div className="flex gap-4">
              <Input
                type="number"
                min={0}
                placeholder="Price"
                value={courseForm.price}
                onChange={(event) =>
                  setCourseForm((prev) => ({
                    ...prev,
                    price: Number(event.target.value ?? 0),
                  }))
                }
              />
              <Input
                placeholder="Category"
                value={courseForm.category}
                onChange={(event) =>
                  setCourseForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
              />
            </div>
            <Input
              placeholder="Thumbnail URL"
              value={courseForm.thumbnail_url}
              onChange={(event) =>
                setCourseForm((prev) => ({
                  ...prev,
                  thumbnail_url: event.target.value,
                }))
              }
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-foreground/30 p-4 text-sm text-foreground/60">
              <UploadCloud size={18} /> Upload preview asset
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={handleUploadVideo}
              />
            </label>

            {shopifyEnabled && selectedCourseId !== "new" && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => callShopifyEndpoint("POST")}
                  disabled={isPending}
                >
                  Sync to Shopify
                </Button>
                {selectedCourse?.shopify_product_id && (
                  <Button
                    variant="ghost"
                    onClick={() => callShopifyEndpoint("DELETE")}
                    disabled={isPending}
                  >
                    Unlink Shopify
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSaveCourse} disabled={isPending}>
                Save course
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeleteCourse}
                disabled={selectedCourseId === "new" || isPending}
              >
                <Trash2 size={16} /> Delete
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">
              Lessons ({lessonsForCourse.length})
            </p>
            <div className="space-y-3">
              {lessonsForCourse.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-2xl border border-foreground/10 p-3 text-sm text-foreground/70"
                >
                  <div className="flex items-center gap-2">
                    <Video size={16} />
                    <span>
                      #{lesson.order} {lesson.title}
                    </span>
                  </div>
                  <span className="text-xs text-foreground/40">
                    {new Date(
                      lesson.created_at ?? Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {!lessonsForCourse.length && (
                <p className="text-xs text-foreground/50">
                  No lessons yet. Create the first lesson to unlock the course
                  experience.
                </p>
              )}
            </div>

            {selectedCourse && (
              <form
                onSubmit={handleAddLesson}
                className="space-y-3 rounded-2xl border border-foreground/10 p-4"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                  Add lesson
                </p>
                <Input name="title" placeholder="Lesson title" required />
                <Input
                  name="videoUrl"
                  placeholder="Video URL"
                  required
                  type="url"
                />
                <Input
                  name="order"
                  placeholder="Order (optional)"
                  type="number"
                  min={1}
                />
                <Button type="submit" variant="secondary" disabled={isPending}>
                  Add lesson
                </Button>
              </form>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
