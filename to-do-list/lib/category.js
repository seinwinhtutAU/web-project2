import { apiClient, NetworkError } from "./apiClient";

export async function fetchCategories() {
  try {
    return await apiClient("/category");
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    if (error instanceof NetworkError) {
      throw new Error(
        "Unable to connect to the server. Please try again later."
      );
    }
    throw error;
  }
}

export async function addCategory(category) {
  return apiClient("/category", {
    method: "POST",
    body: JSON.stringify(category),
  });
}

export async function updateCategory(id, updatedData) {
  return apiClient(`/category/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
}

export async function deleteCategory(id) {
  await apiClient(`/category/${id}`, { method: "DELETE" });
}
