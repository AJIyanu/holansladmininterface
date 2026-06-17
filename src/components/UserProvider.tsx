"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { CurrentUser } from "@/types/auth";

const UserContext = createContext<CurrentUser | null>(null);

interface UserProviderProps {
  user: CurrentUser;
  children: ReactNode;
}

export default function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): CurrentUser {
  const user = useContext(UserContext);

  if (!user) {
    throw new Error("useUser must be used inside UserProvider.");
  }

  return user;
}
