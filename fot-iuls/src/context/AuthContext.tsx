import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  AuthContext,
  type AuthContextValue,
  type AuthResult,
  type SignUpPayload,
  type UserProfile,
} from "./useAuth";

async function loadOrCreateProfile(user: User): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, department, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!error && data) {
    return data as UserProfile;
  }

  const fallbackProfile: UserProfile = {
    id: user.id,
    full_name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
      user.email?.split("@")[0] ||
      "Scholar User",
    email: user.email || "",
    phone: typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "",
    department:
      (typeof user.user_metadata?.department === "string" && user.user_metadata.department.trim()) ||
      "Faculty of Technology",
    role: "student",
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert(fallbackProfile, { onConflict: "id" })
    .select("id, full_name, email, phone, department, role")
    .maybeSingle();

  if (!insertError && inserted) {
    return inserted as UserProfile;
  }

  return fallbackProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  const syncUser = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    const nextUser = nextSession?.user ?? null;
    setUser(nextUser);

    if (nextUser) {
      const loaded = await loadOrCreateProfile(nextUser);
      setProfile(loaded);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        void syncUser(data.session ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        void syncUser(nextSession);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [syncUser]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase is not configured. Check your .env.local settings." };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      return { error: error.message };
    }
    if (data.user) {
      const loaded = await loadOrCreateProfile(data.user);
      setSession(data.session ?? null);
      setUser(data.user);
      setProfile(loaded);
      return { error: null, role: loaded?.role ?? "student" };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase is not configured. Check your .env.local settings." };
    }
    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim(),
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName.trim(),
          department: payload.department?.trim() || "Faculty of Technology",
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {
      error: null,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: { name: string; email: string; phone: string; department: string }): Promise<AuthResult> => {
      if (!user) {
        return { error: "Please sign in to update your profile." };
      }
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: updates.name.trim(),
          email: updates.email.trim(),
          phone: updates.phone.trim(),
          department: updates.department.trim() || "Faculty of Technology",
        })
        .eq("id", user.id)
        .select("id, full_name, email, phone, department, role")
        .single();

      if (error) {
        return { error: error.message };
      }
      setProfile(data as UserProfile);
      return { error: null };
    },
    [user]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const loaded = await loadOrCreateProfile(user);
    setProfile(loaded);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user) && profile?.role === "admin",
      displayName: profile?.full_name || (user?.email ? user.email.split("@")[0] : "Guest"),
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshProfile,
    }),
    [session, user, profile, loading, signIn, signUp, signOut, updateProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
