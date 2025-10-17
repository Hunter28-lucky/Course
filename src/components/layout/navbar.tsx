"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { GraduationCap, LogIn, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { href: "/", label: "Catalog" },
  { href: "/dashboard/student", label: "Student" },
  { href: "/dashboard/admin", label: "Admin" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const activeHref = useMemo(() => {
    return links.find((link) => pathname.startsWith(link.href))?.href ?? "/";
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-6 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-foreground/10 bg-background/80 px-4 py-2 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-xl"
    >
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
        <GraduationCap size={20} />
        <span>CourseCraft</span>
      </Link>

      <nav className="hidden items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-2 py-1 text-xs uppercase tracking-[0.35em] text-foreground/60 sm:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="relative rounded-full px-4 py-2"
          >
            {activeHref === link.href && (
              <motion.span
                layoutId="active-pill"
                className="absolute inset-0 z-0 rounded-full bg-foreground/10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-xs uppercase tracking-[0.25em] text-foreground/60">
              {profile?.role ?? "Member"}
            </div>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link href="/auth/login">
              <LogIn size={16} /> Log in
            </Link>
          </Button>
        )}
      </div>
    </motion.header>
  );
};
