"use client";
import { createContext, useContext } from "react";

const UserContext = createContext<any>(null);

export default function UserProvider({ user, children }: any) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
