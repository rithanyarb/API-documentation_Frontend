// === src/hooks/useApi.js ===
import { useState } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeApiCall = async (apiFunction, ...args) => {
    setLoading(true);
    setError("");

    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeApiCall, setError };
};
