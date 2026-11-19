import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "student" | "lecturer" | "researcher" | "admin";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  role: AppRole;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
  department?: string;
}

export interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  displayName: string;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (payload: SignUpPayload) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (updates: {
    name: string;
    email: string;
    phone: string;
    department: string;
  }) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
