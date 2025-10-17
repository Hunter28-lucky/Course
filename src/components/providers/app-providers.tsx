"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/auth-context";
import { ReactQueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <AuthProvider>
          {children}
          <Toaster position="bottom-center" />
        </AuthProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
};
