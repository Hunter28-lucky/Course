"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    await signUp({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
    });
    setSubmitting(false);
    router.push("/auth/login");
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-3xl border border-foreground/10 bg-background/70 p-8 shadow-[0_50px_80px_-60px_rgba(15,23,42,0.55)]"
    >
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/40">
          Full name
        </label>
        <Input placeholder="Ava Summers" {...form.register("fullName")} />
        {form.formState.errors.fullName && (
          <p className="mt-2 text-xs text-red-500">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>
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
          autoComplete="new-password"
          placeholder="••••••••"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="mt-2 text-xs text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.3em] text-foreground/40">
          Confirm password
        </label>
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="mt-2 text-xs text-red-500">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isLoading || submitting}>
        {submitting ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
};
