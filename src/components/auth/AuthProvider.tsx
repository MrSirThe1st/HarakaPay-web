"use client";

import { createContext, useContext } from "react";
import { useDualAuth } from "@/hooks/useDualAuth";
import type { AuthUser } from "@/lib/adminValidation";
import type { UserProfile } from "@/types/user";

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error: string | null;
    isPredefinedAdmin: boolean;
  }>;
  signOut: () => Promise<{ success: boolean; error: string | null }>;
  isAuthenticated: boolean;
  hasProfile: boolean;
  isAdmin: boolean;
  isSchoolStaff: boolean;
  isPredefinedAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useDualAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
