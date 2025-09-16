export interface Task {
  _id: string;
  title: string;
  startDate: Date;
  dueDate: Date;
  note: string;
  category: string;
  status: "pending" | "completed" | "overdue";
  userId: string;
}

export interface Category {
  _id: string;
  name: string;
  color: string;
  userId: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// New types for authentication
export type UserInput = Omit<User, "_id" | "createdAt">;
export type LoginCredentials = Omit<UserInput, "name">;

export type TaskInput = Omit<Task, "_id">;
export type CategoryInput = Omit<Category, "_id">;

// Custom error classes for better error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "NetworkError";
  }
}

// Constants
// const API_BASE_URL = "http://localhost:3000/api";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// apiClient.ts - A generic API client to reduce code duplication
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: DEFAULT_HEADERS,
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        throw new ApiError(response.status, errorMessage, errorData);
      } catch {
        throw new ApiError(response.status, errorMessage);
      }
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new NetworkError(
      "Failed to connect to the server. Please check your network connection.",
      error
    );
  }
}

// Export the apiClient
export { apiClient };

// Task API functions
export async function fetchTasks(): Promise<Task[]> {
  try {
    return await apiClient<Task[]>("/tasks");
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    if (error instanceof NetworkError) {
      // You might want to show a user-friendly message here
      throw new Error(
        "Unable to connect to the server. Please try again later."
      );
    }
    throw error;
  }
}

export async function addTask(task: TaskInput): Promise<Task> {
  return apiClient<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export async function updateTask(
  id: string,
  updatedData: Partial<Task>
): Promise<Task> {
  return apiClient<Task>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Handle HTTP errors
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

// Category API functions
export async function fetchCategories(): Promise<Category[]> {
  try {
    return await apiClient<Category[]>("/categories");
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

export async function addCategory(category: CategoryInput): Promise<Category> {
  return apiClient<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(category),
  });
}

export async function updateCategory(
  id: string,
  updatedData: Partial<Category>
): Promise<Category> {
  return apiClient<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient(`/categories/${id}`, { method: "DELETE" });
}
