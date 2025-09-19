import { apiClient } from "./apiClient";
export async function signupUser(user) {
  const response = await apiClient("/user", {
    method: "POST",
    body: JSON.stringify(user),
  });
  return response;
}

export async function loginUser(credentials) {
  const allUsers = await apiClient("/user", { method: "GET" });

  const foundUser = allUsers.find((u) => {
    return u.email === credentials.email && u.password === credentials.password;
  });

  if (!foundUser) {
    throw new Error("Invalid email or password");
  }

  return foundUser;
}

/**
 * Fetches the current user's data from local storage
 */
export async function fetchCurrentUser() {
  const user = localStorage.getItem("user");
  if (!user) {
    return null;
  }
  return JSON.parse(user);
}

/** Update current user's email or password */
export async function updateUser(updateData) {
  const currentUser = await fetchCurrentUser();
  if (!currentUser) throw new Error("No user logged in");

  const updatedUser = await apiClient(`/user/${currentUser._id}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });

  // Update localStorage with latest data
  localStorage.setItem("user", JSON.stringify(updatedUser));
  return updatedUser;
}

/** Delete current user */
export async function deleteUser() {
  const currentUser = await fetchCurrentUser();
  if (!currentUser) throw new Error("No user logged in");

  await apiClient(`/user/${currentUser._id}`, { method: "DELETE" });

  // Remove from localStorage
  localStorage.removeItem("user");
  return true;
}
