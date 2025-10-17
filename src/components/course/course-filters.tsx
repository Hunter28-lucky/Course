"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

export type CourseFiltersState = {
  search: string;
  category: string;
  priceRange: [number, number];
};

export const CourseFilters = ({
  filters,
  onFiltersChange,
  courses,
}: {
  filters: CourseFiltersState;
  onFiltersChange: (filters: CourseFiltersState) => void;
  courses: Course[];
}) => {
  const categories = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach((course) => {
      if (course.category) unique.add(course.category);
    });
    return Array.from(unique).sort();
  }, [courses]);

  return (
    <div className="flex w-full flex-wrap items-center gap-4 rounded-3xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
      <Input
        value={filters.search}
        onChange={(event) =>
          onFiltersChange({ ...filters, search: event.target.value })
        }
        placeholder="Search premium courses"
        className="max-w-xs"
      />

      <div className="flex items-center gap-3 text-sm text-foreground/60">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          className={cn(
            "rounded-full border border-foreground/20 bg-background/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-foreground/60"
          )}
          value={filters.category}
          onChange={(event) =>
            onFiltersChange({ ...filters, category: event.target.value })
          }
        >
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 text-sm text-foreground/60">
        <label htmlFor="price">Max Price</label>
        <input
          id="price"
          type="range"
          min={0}
          max={500}
          value={filters.priceRange[1]}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              priceRange: [0, Number(event.target.value)],
            })
          }
        />
        <span className="text-xs font-semibold text-foreground">
          ${filters.priceRange[1]}
        </span>
      </div>
    </div>
  );
};
