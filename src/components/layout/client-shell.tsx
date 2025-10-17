"use client";

import { useRegisterServiceWorker } from "@/lib/register-service-worker";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";

export const ClientShell = ({ children }: { children: React.ReactNode }) => {
  useRegisterServiceWorker();
  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
};
