"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden rounded-[48px] border border-foreground/10 bg-gradient-to-br from-background via-background to-background/20 p-10 shadow-[0_80px_80px_-60px_rgba(15,23,42,0.35)] sm:p-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_55%)]" />
      <div className="grid gap-12 lg:grid-cols-[3fr,2fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/40">
            Elevate your craft
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
          >
            Master premium skills with immersive courses built for creators
            chasing excellence.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="mt-6 max-w-xl text-base text-foreground/60"
          >
            Experience cinematic lessons, motion-crafted interfaces, and
            real-world projects. Every interaction is tuned for smooth
            performance on web and mobile with offline-ready lessons.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button asChild size="lg">
              <Link href="/dashboard/student">Start learning</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/course/demo">
                <Play size={18} /> Watch preview
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="relative aspect-square overflow-hidden rounded-4xl border border-foreground/10 bg-background/40"
        >
          <Image
            src="/images/hero-dashboard.svg"
            alt="Course dashboard preview"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};
