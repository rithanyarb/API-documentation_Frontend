// === src/context/AuthContext.jsx ===
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://api-documentation-backend.onrender.com";

  useEffect(() => {
    handleInitialAuth();
  }, []);

  const handleInitialAuth = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");
    const token = urlParams.get("token");

    if (authStatus === "success") {
      console.log("OAuth success detected");

      // If we have a token in URL, store it temporarily and clean URL
      if (token) {
        console.log("Token found in URL, storing temporarily");
        // Store token temporarily in sessionStorage for this auth flow
        sessionStorage.setItem("temp_auth_token", token);
      }

      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);

      // Wait a bit for cookies to be set, then check auth
      setTimeout(() => {
        checkAuthStatus();
      }, 1000);
    } else if (authStatus === "error") {
      const message = urlParams.get("message") || "Authentication failed";
      console.error("Auth error:", message);
      window.history.replaceState({}, "", window.location.pathname);
      setIsLoading(false);
    } else {
      // Normal page load, check auth status
      checkAuthStatus();
    }
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // First try with cookies
      let response = await fetch(`${BASE_URL}/api/v1/authentication/user`, {
        credentials: "include",
      });

      // If cookie auth fails and we have a temp token, try with Authorization header
      if (!response.ok) {
        const tempToken = sessionStorage.getItem("temp_auth_token");
        if (tempToken) {
          console.log("Cookie auth failed, trying with temp token");
          response = await fetch(`${BASE_URL}/api/v1/authentication/user`, {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${tempToken}`,
            },
          });

          if (response.ok) {
            console.log("Auth successful with temp token");
            // Clear temp token after successful auth
            sessionStorage.removeItem("temp_auth_token");
          }
        }
      }

      if (response.ok) {
        const userData = await response.json();
        console.log("User authenticated:", userData);
        setUser(userData);
      } else {
        console.log("User not authenticated:", response.status);
        setUser(null);
        // Clear any temp tokens on failed auth
        sessionStorage.removeItem("temp_auth_token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      sessionStorage.removeItem("temp_auth_token");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      window.location.href = `${BASE_URL}/api/v1/authentication/login`;
    } catch (error) {
      console.error("Google login failed:", error);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/api/v1/authentication/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      sessionStorage.removeItem("temp_auth_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        logout,
        isLoading,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
