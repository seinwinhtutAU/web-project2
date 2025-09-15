// lib/auth.ts
import { User, UserInput, LoginCredentials } from "./data";
import { apiClient } from "./data";

export async function signupUser(user: UserInput): Promise<User> {
  // Directly use the POST method on the users endpoint
  const response = await apiClient<User>("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
  return response;
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
  // Fetch all users from the database. This is highly inefficient and insecure.
  const allUsers = await apiClient<User[]>("/users", { method: "GET" });

  // Find the user with matching email and password (in plain text).
  const foundUser = allUsers.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (!foundUser) {
    throw new Error("Invalid email or password");
  }

  return foundUser;
}

/**
 * Fetches the current user's data from local storage.
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const user = localStorage.getItem("user");
  if (!user) {
    return null;
  }
  return JSON.parse(user) as User;
}
