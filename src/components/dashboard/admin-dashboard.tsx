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
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
              <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Students</p>
              <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        {shopifyEnabled && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shopify</p>
                <p className="text-lg font-semibold mt-2">
                  {selectedCourse?.shopify_product_id ? "Linked" : "Not Linked"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Course Management */}
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Course Management</h2>
            <p className="text-muted-foreground mt-1">Create and manage your courses</p>
          </div>
          <Button onClick={() => updateCourseForm("new")} size="lg">
            <Plus size={18} />
            New Course
          </Button>
        </div>

        {/* Course Selector */}
        {courses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {courses.map((course) => (
              <Button
                key={course.id}
                variant={selectedCourseId === course.id ? "primary" : "secondary"}
                onClick={() => updateCourseForm(course.id)}
                size="sm"
              >
                {course.title}
              </Button>
            ))}
          </div>
        )}

        {/* Course Form and Lessons */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Course Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Course Title</label>
                <Input
                  placeholder="e.g., Master React in 2025"
                  value={courseForm.title}
                  onChange={(event) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea
                  placeholder="Describe what students will learn..."
                  value={courseForm.description}
                  rows={4}
                  onChange={(event) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Price ($)</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="99"
                    value={courseForm.price}
                    onChange={(event) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        price: Number(event.target.value ?? 0),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Input
                    placeholder="Development"
                    value={courseForm.category}
                    onChange={(event) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Thumbnail URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={courseForm.thumbnail_url}
                  onChange={(event) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      thumbnail_url: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-sm font-medium hover:border-primary/50 hover:bg-accent/50 transition-colors">
                  <UploadCloud size={20} />
                  <span>Upload Preview Image/Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    onChange={handleUploadVideo}
                  />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button onClick={handleSaveCourse} disabled={isPending} size="lg">
                {isPending ? "Saving..." : selectedCourseId === "new" ? "Create Course" : "Save Changes"}
              </Button>
              
              {selectedCourseId !== "new" && (
                <Button
                  variant="secondary"
                  onClick={handleDeleteCourse}
                  disabled={isPending}
                >
                  <Trash2 size={16} />
                  Delete Course
                </Button>
              )}
            </div>

            {shopifyEnabled && selectedCourseId !== "new" && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => callShopifyEndpoint("POST")}
                  disabled={isPending}
                  size="sm"
                >
                  Sync to Shopify
                </Button>
                {selectedCourse?.shopify_product_id && (
                  <Button
                    variant="ghost"
                    onClick={() => callShopifyEndpoint("DELETE")}
                    disabled={isPending}
                    size="sm"
                  >
                    Unlink Shopify
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Lessons Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Course Lessons ({lessonsForCourse.length})
              </h3>
            </div>

            {/* Lessons List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {lessonsForCourse.length > 0 ? (
                lessonsForCourse.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                        {lesson.order}
                      </div>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(lesson.created_at ?? Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Video size={18} className="text-muted-foreground" />
                  </div>
                ))
              ) : (
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                  <Video size={32} className="mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No lessons yet. Add your first lesson below.
                  </p>
                </div>
              )}
            </div>

            {/* Add Lesson Form */}
            {selectedCourse && (
              <form
                onSubmit={handleAddLesson}
                className="space-y-3 rounded-lg border bg-muted/50 p-4"
              >
                <h4 className="font-semibold text-sm">Add New Lesson</h4>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Lesson Title</label>
                  <Input 
                    name="title" 
                    placeholder="e.g., Introduction to React Hooks" 
                    required 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Video URL</label>
                  <Input
                    name="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                    required
                    type="url"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Order (Optional)</label>
                  <Input
                    name="order"
                    placeholder={`${lessonsForCourse.length + 1}`}
                    type="number"
                    min={1}
                  />
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                  <Plus size={16} />
                  {isPending ? "Adding..." : "Add Lesson"}
                </Button>
              </form>
            )}

            {!selectedCourse && (
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Save the course first to add lessons
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
