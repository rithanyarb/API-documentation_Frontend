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

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    checkAuthStatus();

    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");

    if (authStatus === "success") {
      console.log("OAuth success detected");
      window.history.replaceState({}, "", window.location.pathname);
      checkAuthStatus();
    } else if (authStatus === "error") {
      const message = urlParams.get("message") || "Authentication failed";
      console.error("Auth error:", message);
      window.history.replaceState({}, "", window.location.pathname);
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/authentication/user`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("User authenticated:", userData);
        setUser(userData);
      } else {
        console.log("User not authenticated");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
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
