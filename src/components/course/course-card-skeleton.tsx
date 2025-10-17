"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const CourseCardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-4xl border border-foreground/10 bg-background/50 p-6">
    <Skeleton className="h-48 w-full rounded-3xl" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);
