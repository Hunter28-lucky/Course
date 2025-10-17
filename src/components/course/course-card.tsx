"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { formatCurrency, averageRatingLabel, cn } from "@/lib/utils";
import type { Course } from "@/types";

export const CourseCard = ({ course }: { course: Course }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-foreground/10 bg-gradient-to-b from-background/90 to-background/60 p-6 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl"
    >
      <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-3xl">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-foreground/10 text-foreground/70">
            No thumbnail
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/70 backdrop-blur">
          {course.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground/50">
          <span>{averageRatingLabel(course.rating)}</span>
          <span className="flex items-center gap-1 text-foreground">
            <Star size={16} className="fill-foreground/20 text-foreground" />
            {course.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          {course.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm text-foreground/60">
          {course.description}
        </p>

        <div className="mt-6 flex items-center justify-between text-sm font-semibold text-foreground">
          <span>{formatCurrency(course.price)}</span>
          <Link
            href={`/course/${course.id}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-foreground/70 transition-all hover:border-foreground/40 hover:text-foreground"
            )}
          >
            View <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
