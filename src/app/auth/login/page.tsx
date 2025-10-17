import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-10 rounded-[40px] border border-foreground/10 bg-background/60 p-10 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">
          Sign in to continue your learning flow
        </h1>
        <p className="mt-3 text-sm text-foreground/60">
          Seamless access across devices. Install the PWA to keep lessons synced
          even offline.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-xs text-foreground/60">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-foreground hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
