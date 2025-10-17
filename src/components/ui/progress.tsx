"use client";

import { cn } from "@/lib/utils";

export const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-foreground/10", className)}>
      <span
        className="absolute left-0 top-0 h-full rounded-full bg-foreground/80 transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};
