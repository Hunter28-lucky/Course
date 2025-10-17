"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import type { Course, Lesson } from "@/types";
import { formatCurrency } from "@/lib/utils";

type StudentCourseCard = {
  id: string;
  course: Course;
  progress: number;
  lastLesson: Lesson | null;
  purchasedAt: string;
};

export const StudentCourses = ({ courses }: { courses: StudentCourseCard[] }) => {
  if (!courses.length) {
    return (
      <Card className="text-center text-sm text-foreground/60">
        You haven&apos;t purchased any courses yet. Explore the catalog to start
        learning.
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {courses.map((item) => {
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
                    Purchased {new Date(item.purchasedAt).toLocaleDateString()}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">
                    {item.course.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/60">
                    {item.course.description}
                  </p>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.3em] text-foreground/40">
                  Progress
                  <p className="text-lg font-semibold text-foreground">
                    {item.progress}%
                  </p>
                </div>
              </div>
              <ProgressBar value={item.progress} />
              <div className="flex items-center justify-between rounded-3xl bg-foreground/5 p-4 text-xs text-foreground/60">
                <div>
                  <p className="uppercase tracking-[0.3em]">Last lesson</p>
                  <p className="mt-1 text-sm text-foreground">
                    {item.lastLesson ? item.lastLesson.title : "Not started"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="uppercase tracking-[0.3em]">Investment</p>
                  <p className="mt-1 text-sm text-foreground">
                    {formatCurrency(item.course.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button asChild size="sm">
                  <Link href={`/course/${item.course.id}`}>
                    <Play size={16} /> Resume
                  </Link>
                </Button>
                <Link
                  href={`/course/${item.course.id}`}
                  className="text-xs uppercase tracking-[0.3em] text-foreground/40 transition hover:text-foreground"
                >
                  View details <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
