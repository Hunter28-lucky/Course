import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-foreground/40">
        Not found
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-foreground">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-4 text-sm text-foreground/60">
        The content you&apos;re looking for may have been moved or is restricted to
        specific roles. Try navigating back to the homepage.
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
