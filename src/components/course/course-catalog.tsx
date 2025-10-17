"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CourseCard } from "@/components/course/course-card";
import { CourseCardSkeleton } from "@/components/course/course-card-skeleton";
import {
  CourseFilters,
  type CourseFiltersState,
} from "@/components/course/course-filters";
import { averageRatingLabel } from "@/lib/utils";
import type { Course } from "@/types";

const DEFAULT_FILTERS: CourseFiltersState = {
  search: "",
  category: "",
  priceRange: [0, 500],
};

export const CourseCatalog = ({
  courses,
  isLoading,
}: {
  courses: Course[];
  isLoading?: boolean;
}) => {
  const [filters, setFilters] = useState<CourseFiltersState>(DEFAULT_FILTERS);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) =>
        course.title.toLowerCase().includes(filters.search.toLowerCase())
      )
      .filter((course) =>
        filters.category ? course.category === filters.category : true
      )
      .filter((course) => course.price <= filters.priceRange[1]);
  }, [courses, filters]);

  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
            Premium catalog
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">
            Learn from industry-leading creators
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground/60">
            Crafted learning paths with cinematic lessons, guided projects, and
            support from a vibrant community. Each course is curated to deliver a
            high-impact experience.
          </p>
        </div>
        <CourseFilters
          courses={courses}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filteredCourses.length === 0 ? (
              <motion.div
                layout
                className="col-span-full rounded-4xl border border-foreground/10 bg-background/60 p-12 text-center text-sm text-foreground/60"
              >
                No courses match your filters yet. Try adjusting search or price
                range to explore more offerings.
              </motion.div>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard course={course} key={course.id} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {!isLoading && filteredCourses.length > 0 && (
        <div className="rounded-4xl border border-foreground/10 bg-gradient-to-r from-background/80 via-background/50 to-background/80 p-6 text-xs uppercase tracking-[0.4em] text-foreground/50">
          Trending quality: {averageRatingLabel(filteredCourses[0]?.rating ?? 0)}
        </div>
      )}
    </section>
  );
};
