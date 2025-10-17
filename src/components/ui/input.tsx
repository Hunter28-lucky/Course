"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-xl border border-foreground/20 bg-background/80 px-4 py-3 text-sm shadow-sm shadow-foreground/5 transition focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/30 dark:border-background/30 dark:bg-background/40",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
