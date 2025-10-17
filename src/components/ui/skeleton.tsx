"use client";

import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-pulse rounded-2xl bg-foreground/10 dark:bg-background/30",
      className
    )}
  />
);
