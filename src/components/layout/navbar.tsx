"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Home, LayoutDashboard, Shield, LogIn, LogOut, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const navLinks = useMemo(() => {
    const baseLinks = [
      { href: "/", label: "Browse Courses", icon: Home, show: true },
    ];

    if (user) {
      baseLinks.push({
        href: "/dashboard/student",
        label: "My Learning",
        icon: BookOpen,
        show: true,
      });

      if (profile?.role === "admin") {
        baseLinks.push({
          href: "/dashboard/admin",
          label: "Admin",
          icon: Shield,
          show: true,
        });
      }
    }

    return baseLinks.filter((link) => link.show);
  }, [user, profile]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard size={20} />
          </div>
          <span className="hidden sm:inline">CourseCraft</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{profile?.full_name || "User"}</span>
                <span className="text-xs text-muted-foreground capitalize">{profile?.role || "Student"}</span>
              </div>
              <Button variant="secondary" onClick={signOut} className="gap-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/auth/login" className="gap-2">
                <LogIn size={16} />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
