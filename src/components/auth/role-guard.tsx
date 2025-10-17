"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export const RoleGuard = ({
  children,
  allow,
  redirectTo = "/auth/login",
}: {
  children: React.ReactNode;
  allow: Role[];
  redirectTo?: string;
}) => {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (profile && !allow.includes(profile.role)) {
      const destination = profile.role === "admin" ? "/dashboard/admin" : "/dashboard/student";
      router.replace(destination);
    }
  }, [allow, isLoading, profile, redirectTo, router, user]);

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!profile || !allow.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
};
