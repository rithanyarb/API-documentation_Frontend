//=== src/api.js ===
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${BASE_URL}/api/v1`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const analyticsClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Authentication required");
    }
    return Promise.reject(error);
  }
);

// ============ AUTHENTICATION APIs (Session-based) ============

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/authentication/user`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/authentication/logout`, {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Logout failed:", error);
    return false;
  }
};

// ============ OPENAPI JSON / YAML APIs ============

export const uploadOpenAPI = async (payload) => {
  try {
    const response = await apiClient.post("/openapi/upload", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const uploadOpenAPIFile = async (file, baseUrl = null) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams();
    if (baseUrl) {
      params.append("base_url", baseUrl);
    }

    const url = `/openapi/upload-file${baseUrl ? `?${params.toString()}` : ""}`;

    const response = await apiClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const fetchTemplates = async (projectId) => {
  try {
    const response = await apiClient.get(
      `/openapi/project/${projectId}/templates`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// ============ CURL APIs ============

export const uploadCurl = async (payload) => {
  try {
    const response = await apiClient.post("/curl/upload", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// ============ CODE ANALYSIS APIs ============

export const uploadBackendZip = async (file, format = "json") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    const response = await apiClient.post(
      "/code/upload-backend-zip",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "text",
      }
    );
    return {
      data: response.data,
      format,
    };
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const uploadGithubRepo = async (repoUrl, format = "json") => {
  try {
    const formData = new FormData();
    formData.append("repo_url", repoUrl);
    formData.append("format", format);

    const response = await apiClient.post(
      "/code/upload-github-repo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "text",
      }
    );
    return {
      data: response.data,
      format,
    };
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// ============ TESTING APIs ============

export const testEndpoint = async (payload) => {
  try {
    const response = await apiClient.post("/test-endpoint", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// ============ ANALYTICS APIs ============

export const trackFeatureUsage = async (feature, userId = null) => {
  try {
    const response = await analyticsClient.post("/analytics/track", {
      feature,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to track usage:", error);
    // Don't throw error for analytics to avoid breaking main functionality
    return null;
  }
};

export const getGlobalStats = async () => {
  try {
    const response = await analyticsClient.get("/analytics/global");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await analyticsClient.get(`/analytics/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// ============ UTILITY FUNCTIONS ============

// Generic API request function (for custom endpoints)
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await apiClient.request({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// Legacy functions
export const getToken = () => null;
export const isAuthenticated = () => false;
export const authenticateWithGoogle = async () => {
  throw new Error("Use session-based auth");
};
