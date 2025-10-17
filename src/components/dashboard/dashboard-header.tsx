"use client";

import { motion } from "framer-motion";

export const DashboardHeader = ({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta?: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-foreground/10 bg-background/70 p-8"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
          {subtitle}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">{title}</h1>
      </div>
      {cta && <div>{cta}</div>}
    </motion.div>
  );
};
