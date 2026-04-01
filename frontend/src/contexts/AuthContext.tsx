"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface UserProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  role?: string | null;
  full_name?: string;
  force_password_change?: boolean;
  user_metadata?: Record<string, any> | null;
  profile?: UserProfile | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  loading: boolean;
  userRole: "researcher" | "participant" | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"researcher" | "participant" | null>(null);

  // Session timeout: 30 min inactivity (HIPAA)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (session) {
        timeoutId = setTimeout(async () => {
          await signOutFn();
        }, 30 * 60 * 1000);
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session]);

  const fetchMe = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setUser(null);
      setSession(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiClient.get<AuthUser>("/api/auth/me");
      setUser(data);
      setSession({ access_token: token });
      setUserRole((data.role as "researcher" | "participant") || null);
    } catch {
      localStorage.removeItem("auth_token");
      setUser(null);
      setSession(null);
      setUserRole(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const signOutFn = async () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const refreshUser = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signOut: signOutFn, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
