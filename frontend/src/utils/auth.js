import { backend_url } from "./helper";

// Utility function to make authenticated API calls
export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  // Prepend backend_url if url doesn't start with http
  const fullUrl = url.startsWith("http") ? url : `${backend_url}${url}`;

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Add Authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, config);
    return response;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Helper function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
