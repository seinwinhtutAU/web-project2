import { apiClient, NetworkError } from "./apiClient";

export async function fetchTasks() {
  try {
    return await apiClient("/task");
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    if (error instanceof NetworkError) {
      throw new Error(
        "Unable to connect to the server. Please try again later."
      );
    }
    throw error;
  }
}

export async function addTask(task) {
  return apiClient("/task", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export async function updateTask(id, updatedData) {
  return apiClient(`/task/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
}

export async function deleteTask(id) {
  try {
    const response = await fetch(`/api/task/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete task");
    }
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Network error: Failed to connect to the server. Please check your network connection."
      );
    }
    throw error;
  }
}
