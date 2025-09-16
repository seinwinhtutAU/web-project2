// "use client";

// import { createContext, useContext, useState, useEffect } from "react";
// import { User, UserInput, LoginCredentials } from "./lib/data";
// import { signupUser, loginUser, fetchCurrentUser } from "./lib/auth";

// interface UserContextType {
//   currentUser: User | null;
//   setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
//   signup: (user: UserInput) => Promise<void>;
//   login: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => void;
//   refreshUser: () => Promise<void>;
// }

// export const UserContext = createContext<UserContextType | undefined>(
//   undefined
// );

// export default function UserProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);

//   const refreshUser = async () => {
//     const user = await fetchCurrentUser();
//     setCurrentUser(user);
//   };

//   const signup = async (user: UserInput) => {
//     const newUser = await signupUser(user);
//     localStorage.setItem("user", JSON.stringify(newUser));
//     setCurrentUser(newUser);
//   };

//   const login = async (credentials: LoginCredentials) => {
//     const user = await loginUser(credentials);
//     localStorage.setItem("user", JSON.stringify(user));
//     setCurrentUser(user);
//   };

//   const logout = () => {
//     localStorage.removeItem("user");
//     setCurrentUser(null);
//   };

//   useEffect(() => {
//     refreshUser();
//   }, []);

//   return (
//     <UserContext.Provider
//       value={{
//         currentUser,
//         setCurrentUser,
//         signup,
//         login,
//         logout,
//         refreshUser,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// }

// export function useUser() {
//   const context = useContext(UserContext);
//   if (!context) throw new Error("useUser must be used within a UserProvider");
//   return context;
// }

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User, UserInput, LoginCredentials } from "./lib/data";
import { signupUser, loginUser, fetchCurrentUser } from "./lib/auth";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  signup: (user: UserInput) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isHydrated: boolean; // <- track hydration
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshUser = async () => {
    const user = await fetchCurrentUser();
    setCurrentUser(user);
  };

  const signup = async (user: UserInput) => {
    const newUser = await signupUser(user);
    localStorage.setItem("user", JSON.stringify(newUser));
    setCurrentUser(newUser);
  };

  const login = async (credentials: LoginCredentials) => {
    const user = await loginUser(credentials);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
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
