"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    await signIn(values.email, values.password);
    setSubmitting(false);
    router.push("/dashboard/student");
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-3xl border border-foreground/10 bg-background/70 p-8 shadow-[0_50px_80px_-60px_rgba(15,23,42,0.55)]"
    >
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/40">
          Email
        </label>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="mt-2 text-xs text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/40">
          Password
        </label>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="mt-2 text-xs text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isLoading || submitting}>
        {submitting ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
};
