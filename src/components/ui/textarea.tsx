"use client";

import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[120px] w-full rounded-xl border border-foreground/20 bg-background/80 px-4 py-3 text-sm shadow-sm shadow-foreground/5 transition focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/30 dark:border-background/30 dark:bg-background/40",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
