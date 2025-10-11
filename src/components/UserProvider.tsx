"use client";
import { createContext, useContext, ReactNode } from "react";

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

const UserContext = createContext<User | null>(null);

interface UserProviderProps {
  user: User | null;
  children: ReactNode;
}

export default function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  return context;
};
