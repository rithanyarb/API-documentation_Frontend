//=== src/api.js ===
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE_URL = `${BASE_URL}/api/v1`;

//timeout for large file
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 600000, // 10 minutes
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

    if (error.response?.status === 413) {
      const message = error.response?.data?.detail || "File too large";
      throw new Error(message);
    } else if (error.response?.status === 408) {
      throw new Error(
        "Request timeout. The operation took too long to complete."
      );
    } else if (error.response?.status === 404) {
      throw new Error(error.response?.data?.detail || "Resource not found");
    } else if (error.response?.status === 403) {
      throw new Error(error.response?.data?.detail || "Access forbidden");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
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
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      throw new Error(
        `File too large. Maximum size: ${MAX_SIZE / (1024 * 1024)}MB`
      );
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      throw new Error("Only ZIP files are allowed");
    }

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
        transformResponse: [(data) => data],
      }
    );

    return {
      data: response.data,
      format,
      headers: response.headers,
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Upload timeout. The file might be too large or processing is taking too long."
      );
    }
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const uploadGithubRepo = async (repoUrl, format = "json") => {
  try {
    if (!repoUrl.trim()) {
      throw new Error("Repository URL cannot be empty");
    }

    const formData = new FormData();
    formData.append("repo_url", repoUrl.trim());
    formData.append("format", format);

    const response = await apiClient.post(
      "/code/upload-github-repo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "text",
        transformResponse: [(data) => data],
      }
    );

    return {
      data: response.data,
      format,
      headers: response.headers,
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Repository cloning timeout. The repository might be too large or network is slow."
      );
    }
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// ============ CODE ANALYSIS UTILITY APIS ============

export const getCodeLimits = async () => {
  try {
    const response = await apiClient.get("/code/limits");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const validateRepoUrl = async (repoUrl) => {
  try {
    const formData = new FormData();
    formData.append("repo_url", repoUrl);

    const response = await apiClient.post("/code/validate-repo-url", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};

// ============ TESTING APIs ============

export const testEndpoint = async (payload) => {
  try {
    console.log("Testing endpoint with payload:", payload);

    const response = await apiClient.post("/test-endpoint", payload, {
      timeout: 1000000, // 100 second timeout
    });

    console.log("Test response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Test endpoint error:", error);

    if (error.response?.status === 408) {
      throw new Error(
        "Request timeout. The target server took too long to respond."
      );
    } else if (error.response?.status === 503) {
      throw new Error(
        error.response?.data?.detail ||
          "Cannot connect to target server. Make sure it's running and accessible."
      );
    } else if (error.response?.status === 500) {
      throw new Error(
        error.response?.data?.detail || "Server error during test execution."
      );
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Test timeout. The request took too long to complete.");
    }

    throw new Error(
      error.response?.data?.detail || error.message || "Test failed"
    );
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

//file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

//legacy functions
export const getToken = () => null;
export const isAuthenticated = () => false;
export const authenticateWithGoogle = async () => {
  throw new Error("Use session-based auth");
};
