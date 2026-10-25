"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { http, setUnauthorizedHandler, tokenStorage } from "@/core/api/http";
import type { Os, User } from "@/shared/types/api";

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: { email: string; password: string; nickname: string; deviceType: Os | ""; deviceModelId: number | null }) => Promise<User>;
  logout: () => void;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthState | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider 안에서만 쓸 수 있어요");
  return v;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => { tokenStorage.clear(); setUser(null); }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStorage.get()) { setReady(true); return () => setUnauthorizedHandler(null); }
    http.get<User>("/me").then(setUser).catch(() => tokenStorage.clear()).finally(() => setReady(true));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo<AuthState>(() => ({
    user, ready, logout, setUser,
    async login(email, password) {
      const r = await http.post<{ token: string; user: User }>("/auth/login", { email, password });
      tokenStorage.set(r.token); setUser(r.user); return r.user;
    },
    async signup(input) {
      const r = await http.post<{ token: string; user: User }>("/auth/signup", input);
      tokenStorage.set(r.token); setUser(r.user); return r.user;
    },
  }), [user, ready, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
