// === src/context/AnalyticsContext.jsx ===
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  trackFeatureUsage as trackUsageAPI,
  getGlobalStats,
  getUserStats,
} from "../api";

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const { user } = useAuth();

  const [globalStats, setGlobalStats] = useState({
    total_users: 0,
    feature_usage: {
      openapijson: 0,
      curl: 0,
      backendzip: 0,
      githubrepo: 0,
    },
  });

  const [userStats, setUserStats] = useState({
    openapijson: 0,
    curl: 0,
    backendzip: 0,
    githubrepo: 0,
  });

  // Load backend stats
  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const stats = await getGlobalStats();
        setGlobalStats(stats);
      } catch (error) {
        console.error("Failed to load global stats:", error);
      }
    };

    loadGlobalStats();
  }, []);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user) {
        try {
          const stats = await getUserStats(user.id);
          setUserStats(stats);
        } catch (error) {
          console.error("Failed to load user stats:", error);
        }
      }
    };

    loadUserStats();
  }, [user]);

  const trackFeatureUsage = async (feature) => {
    try {
      await trackUsageAPI(feature, user?.id);

      setGlobalStats((prev) => ({
        ...prev,
        feature_usage: {
          ...prev.feature_usage,
          [feature]: prev.feature_usage[feature] + 1,
        },
      }));

      if (user) {
        setUserStats((prev) => ({
          ...prev,
          [feature]: prev[feature] + 1,
        }));
      }
    } catch (error) {
      console.error("Failed to track feature usage:", error);
    }
  };

  const trackNavigationUsage = async (path) => {
    const pathToFeatureMap = {
      "/openapijson": "openapijson",
      "/curl": "curl",
      "/backendzip": "backendzip",
      "/githubrepo": "githubrepo",
    };

    const feature = pathToFeatureMap[path];
    if (feature) {
      console.log(`📊 Tracking navigation to: ${feature}`);
      await trackFeatureUsage(feature);
    }
  };

  const trackAndNavigate = async (feature, navigate, path) => {
    await trackFeatureUsage(feature);
    navigate(path);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        globalStats,
        userStats,
        trackFeatureUsage,
        trackNavigationUsage,
        trackAndNavigate,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
