"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  signupUser,
  loginUser,
  fetchCurrentUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
} from "@/lib/auth";

export const UserContext = createContext(undefined);

export default function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshUser = async () => {
    const user = await fetchCurrentUser();
    setCurrentUser(user);
  };

  const signup = async (user) => {
    const newUser = await signupUser(user);
    localStorage.setItem("user", JSON.stringify(newUser));
    setCurrentUser(newUser);
  };

  const login = async (credentials) => {
    const user = await loginUser(credentials);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  /** Update email or password */
  const updateUser = async (updateData) => {
    if (!currentUser) throw new Error("No user logged in");

    const updatedUser = await apiUpdateUser(updateData);
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  };

  /** Delete current user */
  const deleteUser = async () => {
    if (!currentUser) throw new Error("No user logged in");

    await apiDeleteUser();
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    refreshUser().finally(() => setIsHydrated(true));
  }, []);

  // Don't render children until hydration is complete
  if (!isHydrated) return null;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        signup,
        login,
        logout,
        refreshUser,
        updateUser,
        deleteUser,
        isHydrated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
