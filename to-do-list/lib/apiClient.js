export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// apiClient.js - A generic API client to reduce code duplication
async function apiClient(endpoint, options = {}) {
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
      return undefined;
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

export { apiClient };
