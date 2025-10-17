"use client";

import { cn } from "@/lib/utils";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-3xl border border-foreground/10 bg-background/70 p-6 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-background/20 dark:bg-background/30",
      className
    )}
  >
    {children}
  </div>
);
