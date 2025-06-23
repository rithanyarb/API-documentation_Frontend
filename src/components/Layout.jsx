// === src/components/Layout.jsx ===
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Globe,
  Terminal,
  Upload,
  Github,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAnalytics } from "../context/AnalyticsContext";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { trackNavigationUsage } = useAnalytics();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs = [
    { id: "home", label: "Home", path: "/home", icon: Home },
    {
      id: "openapijson",
      label: "OpenAPI JSON",
      path: "/openapijson",
      icon: Globe,
    },
    { id: "curl", label: "cURL Command", path: "/curl", icon: Terminal },
    {
      id: "backendzip",
      label: "Backend ZIP",
      path: "/backendzip",
      icon: Upload,
    },
    {
      id: "githubrepo",
      label: "GitHub Repository",
      path: "/githubrepo",
      icon: Github,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = async (path) => {
    console.log(`📊 Tracking navigation to: ${path}`);

    await trackNavigationUsage(path);

    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        {/* Top Bar with User Menu */}
        {user && (
          <div className="relative border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 py-3">
              <div className="flex justify-end">
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Header Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            API Documentation Generator
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Transform your APIs into beautiful, interactive documentation with
            multiple input methods
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavigation(tab.path)}
                  className={`flex items-center px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${
                    isActive(tab.path)
                      ? "text-blue-600 border-blue-600 bg-blue-50"
                      : "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300"
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">{children}</div>
    </div>
  );
};

export default Layout;
