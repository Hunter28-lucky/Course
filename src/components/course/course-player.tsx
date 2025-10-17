"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Play, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Course, Lesson, Progress } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { cacheVideoForOffline, getLastLesson, rememberLastLesson } from "@/lib/offline";
import { formatCurrency } from "@/lib/utils";

export const CoursePlayer = ({
  course,
  lessons,
  purchased,
  initialProgress,
}: {
  course: Course;
  lessons: Lesson[];
  purchased: boolean;
  initialProgress: Progress[];
}) => {
  const { supabase, user, refreshProfile } = useAuth();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [isPurchased, setIsPurchased] = useState(purchased);

  useEffect(() => {
    setIsPurchased(purchased);
  }, [purchased]);

  const completedLessonIds = useMemo(
    () => new Set(progress.filter((item) => item.completed).map((item) => item.lesson_id)),
    [progress]
  );

  useEffect(() => {
    const hydrateLastLesson = async () => {
      const stored = await getLastLesson(course.id);
      if (stored && lessons.some((lesson) => lesson.id === stored)) {
        setActiveLessonId(stored);
      } else {
        setActiveLessonId(lessons[0]?.id ?? null);
      }
    };

    hydrateLastLesson();
  }, [course.id, lessons]);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0],
    [lessons, activeLessonId]
  );

  const completedCount = completedLessonIds.size;

  const completionPercent = useMemo(() => {
    if (!lessons.length) return 0;
    return Math.round((completedCount / lessons.length) * 100);
  }, [lessons.length, completedCount]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please sign in to purchase the course");
      return;
    }

    setIsPurchasing(true);

    const { error } = await supabase.from("purchases").insert({
      user_id: user.id,
      course_id: course.id,
    });

    if (error) {
      console.error(error);
      toast.error("Unable to complete purchase");
    } else {
      toast.success("Course unlocked! Enjoy your learning journey ✨");
      await refreshProfile();
      setIsPurchased(true);
    }

    setIsPurchasing(false);
  };

  const handleLessonCompleted = async (lesson: Lesson) => {
    if (!user) return;

    const { error } = await supabase.from("progress").upsert(
      {
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

    if (error) {
      console.error(error);
      toast.error("Unable to update progress");
      return;
    }

    setProgress((prev) => {
      const withoutLesson = prev.filter((item) => item.lesson_id !== lesson.id);
      return [
        ...withoutLesson,
        {
          id: lesson.id,
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          updated_at: new Date().toISOString(),
        },
      ];
    });
  };

  const handleLessonClick = async (lesson: Lesson) => {
    if (!isPurchased && lesson.id !== lessons[0]?.id) {
      toast.error("Purchase the course to unlock this lesson");
      return;
    }

    setActiveLessonId(lesson.id);
    await rememberLastLesson(course.id, lesson.id);
  };

  useEffect(() => {
    if (!activeLesson?.video_url) return;
    cacheVideoForOffline(activeLesson.video_url);
  }, [activeLesson?.video_url]);

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr,2fr]">
      <Card className="overflow-hidden p-0">
        <div className="aspect-video bg-foreground/10">
          {activeLesson?.video_url ? (
            <video
              key={activeLesson.id}
              controls
              className="h-full w-full"
              src={activeLesson.video_url}
              onEnded={() => handleLessonCompleted(activeLesson)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-foreground/60">
              Select a lesson to begin
            </div>
          )}
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
                Lesson {activeLesson?.order ?? 1}
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                {activeLesson?.title}
              </h2>
            </div>
            <ProgressBar value={completionPercent} className="w-40" />
          </div>

          <div className="rounded-3xl bg-foreground/5 p-4 text-xs text-foreground/60">
            <p>
              Offline ready: we automatically cache your last watched lesson so
              you can resume without connection.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                Course overview
              </p>
              <h3 className="text-xl font-semibold text-foreground">
                {course.title}
              </h3>
            </div>
            <div className="text-right text-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                Completion
              </p>
              <p className="font-semibold text-foreground">{completionPercent}%</p>
            </div>
          </div>
          <p className="text-sm text-foreground/60">{course.description}</p>
          <div className="flex items-center justify-between rounded-2xl bg-foreground/5 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                Investment
              </p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(course.price)}
              </p>
            </div>
            {isPurchased ? (
              <div className="flex items-center gap-2 rounded-full bg-foreground/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-foreground">
                <ShieldCheck size={16} /> Enrolled
              </div>
            ) : (
              <Button size="lg" onClick={handlePurchase} disabled={isPurchasing}>
                {isPurchasing ? "Processing" : "Buy Course"}
              </Button>
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
            Lessons
          </p>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const locked = !isPurchased && lesson.id !== lessons[0]?.id;
              const completed = completedLessonIds.has(lesson.id);

              return (
                <motion.button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  disabled={locked}
                  whileTap={{ scale: 0.98 }}
                  className="group flex w-full items-center justify-between rounded-3xl border border-foreground/10 bg-background/70 px-4 py-3 text-left text-sm transition hover:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                      Lesson {lesson.order}
                    </p>
                    <p className="font-medium text-foreground">{lesson.title}</p>
                  </div>
                  {locked ? (
                    <Lock size={16} className="text-foreground/40" />
                  ) : completed ? (
                    <ShieldCheck size={18} className="text-foreground" />
                  ) : (
                    <Play size={16} className="text-foreground/60" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
