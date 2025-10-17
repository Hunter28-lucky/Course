"use client";

import { useEffect, useState } from "react";
import { MonitorSmartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setTimeout(() => setVisible(true), 1200);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const onInstallClick = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      // Cast for browsers supporting the BeforeInstallPromptEvent interface.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const promptEvent = deferredPrompt as any;
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
        setDeferredPrompt(null);
      }
    }
  };

  if (!visible) return null;

  return (
    <Card className="fixed bottom-6 right-6 z-50 max-w-sm border-foreground/20 bg-background/90 p-5 shadow-[0_30px_60px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-foreground/10 p-3 text-foreground">
          <MonitorSmartphone size={22} />
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="text-base font-semibold text-foreground">
            Install CourseCraft
          </h4>
          <p className="text-foreground/60">
            Install the app to continue learning offline and capture your next
            lessons seamlessly.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onInstallClick}>
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setVisible(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
        <button
          className="text-foreground/30 transition hover:text-foreground/80"
          onClick={() => setVisible(false)}
          aria-label="Close install prompt"
        >
          <X size={16} />
        </button>
      </div>
    </Card>
  );
};
