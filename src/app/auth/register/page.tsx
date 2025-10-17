import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-10 rounded-[40px] border border-foreground/10 bg-background/60 p-10 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
          Start learning
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">
          Create a CourseCraft account
        </h1>
        <p className="mt-3 text-sm text-foreground/60">
          Sign up to unlock premium courses designed with Supabase-powered
          progress tracking and offline-ready videos.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-xs text-foreground/60">
        Already part of the community?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
