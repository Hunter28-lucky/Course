"use client";

import Link from "next/link";

const footerLinks = [
  { title: "Product", items: ["Catalog", "Roadmap", "Changelog"] },
  { title: "Community", items: ["Events", "Ambassadors", "Stories"] },
  { title: "Company", items: ["About", "Careers", "Contact"] },
];

export const Footer = () => {
  return (
    <footer className="mt-24 rounded-[40px] border border-foreground/10 bg-background/60 p-12 text-sm text-foreground/60 backdrop-blur">
      <div className="grid gap-10 md:grid-cols-[2fr,1fr,1fr,1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/40">
            CourseCraft
          </p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">
            Build premium learning experiences that feel handcrafted.
          </h3>
          <p className="mt-3 max-w-sm text-foreground/60">
            Designed for creators, professionals, and teams shipping delightful
            education products. Deploy to the web and install as a native-feel
            app in minutes.
          </p>
        </div>
        {footerLinks.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
              {section.title}
            </p>
            <ul className="space-y-2 text-sm">
              {section.items.map((item) => (
                <li key={item}>
                  <Link
                    className="text-foreground/60 transition hover:text-foreground"
                    href="#"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-foreground/40">
        <span>© {new Date().getFullYear()} CourseCraft. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
          <Link href="#">Status</Link>
        </div>
      </div>
    </footer>
  );
};
