// === src/router/index.jsx ===
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AnalyticsProvider } from "../context/AnalyticsContext";
import LoginScreen from "../components/LoginScreen";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import OpenAPIJSON from "../pages/OpenAPIJSON";
import CurlCommand from "../pages/CurlCommand";
import BackendZIP from "../pages/BackendZIP";
import GitHubRepository from "../pages/GitHubRepository";
import { Loader2 } from "lucide-react";

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/openapijson" element={<OpenAPIJSON />} />
      <Route path="/curl" element={<CurlCommand />} />
      <Route path="/backendzip" element={<BackendZIP />} />
      <Route path="/githubrepo" element={<GitHubRepository />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function AppRouter() {
  return (
    <Router>
      <AuthProvider>
        <AnalyticsProvider>
          <AppContent />
        </AnalyticsProvider>
      </AuthProvider>
    </Router>
  );
}
