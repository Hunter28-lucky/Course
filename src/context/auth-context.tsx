"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { Profile, Role } from "@/types";

export type AuthContextValue = {
  supabase: ReturnType<typeof getSupabaseBrowserClient>;
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (options: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role")
      .eq("id", currentSession.user.id)
      .maybeSingle();

    if (error) {
      toast.error("Unable to fetch profile");
      console.error(error);
      return;
    }

    if (data) {
      setProfile(data as Profile);
    }
  }, [supabase]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      setSession(initialSession);
      await loadProfile(initialSession);
      setIsLoading(false);
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      await loadProfile(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back! ✨");
    }
    setIsLoading(false);
  };

  const signUp = async ({
    email,
    password,
    fullName,
  }: {
    email: string;
    password: string;
    fullName: string;
  }) => {
    setIsLoading(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

      if (user) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email,
          full_name: fullName,
          role: "student" as Role,
        });

      if (insertError) {
        console.error(insertError);
        toast.error("Unable to create profile record");
      }
    }

    toast.success("Check your inbox to confirm your email");
    setIsLoading(false);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    }
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    await loadProfile(session);
  };

  const value: AuthContextValue = {
    supabase,
    user: session?.user ?? null,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};
