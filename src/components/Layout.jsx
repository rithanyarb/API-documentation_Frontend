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
    console.log(`Tracking navigation to: ${path}`);
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
      {/*Header*/}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Title hover effect*/}
            <div className="flex-shrink-0 relative group">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 cursor-pointer transition-all duration-300 group-hover:scale-105">
                API Documentation Generator
              </h1>

              {/*Hover*/}
              <div className="absolute top-full left-0 mt-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                Transform your APIs into beautiful, interactive documentation
                with multiple input methods
              </div>
            </div>

            {/*tabs*/}
            <div className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-3xl">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigation(tab.path)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                      isActive(tab.path)
                        ? "bg-white/20 text-white"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/*user Menu*/}
            {user && (
              <div className="relative user-menu flex-shrink-0">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block">
                    {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/*Dropdownmenu*/}
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
            )}
          </div>

          {/*Mobile Navigation*/}
          <div className="md:hidden pb-4">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavigation(tab.path)}
                    className={`flex items-center px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-all duration-200 ${
                      isActive(tab.path)
                        ? "bg-white/20 text-white"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
};

export default Layout;
