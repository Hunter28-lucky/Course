"use client";

import { useEffect } from "react";

const SERVICE_WORKER_PATH = "/service-worker.js";

export const useRegisterServiceWorker = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          SERVICE_WORKER_PATH,
          { scope: "/" }
        );
        if (process.env.NODE_ENV === "development") {
          console.info("Service worker registered", registration);
        }
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    };

    register();
  }, []);
};
