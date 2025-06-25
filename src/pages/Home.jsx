// === src/pages/Home.jsx ===
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PieChart from "../components/PieChart";
import StatsCard from "../components/StatsCard";
import {
  Globe,
  Terminal,
  Upload,
  Github,
  Users,
  BarChart3,
  TrendingUp,
  User,
  LogIn,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAnalytics } from "../context/AnalyticsContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();
  const { globalStats, userStats, trackAndNavigate } = useAnalytics();

  const uploadOptions = [
    {
      id: "openapijson",
      title: "OpenAPI JSON/YAML",
      description: "Upload from OpenAPI URL or .json/.yaml file",
      icon: Globe,
      color: "from-blue-500 to-blue-600",
      path: "/openapijson",
    },
    {
      id: "curl",
      title: "cURL Command",
      description: "Generate from cURL command",
      icon: Terminal,
      color: "from-green-500 to-green-600",
      path: "/curl",
    },
    {
      id: "backendzip",
      title: "Backend ZIP",
      description: "Upload backend code as ZIP file",
      icon: Upload,
      color: "from-purple-500 to-purple-600",
      path: "/backendzip",
    },
    {
      id: "githubrepo",
      title: "GitHub Repository",
      description: "Clone and analyze GitHub repository",
      icon: Github,
      color: "from-gray-600 to-gray-700",
      path: "/githubrepo",
    },
  ];

  //tracking
  const handleFeatureClick = async (feature, path) => {
    console.log(`Tracking card click: ${feature}`);
    await trackAndNavigate(feature, navigate, path);
  };

  const userTotal = Object.values(userStats).reduce((sum, val) => sum + val, 0);
  const globalTotal = Object.values(globalStats.feature_usage || {}).reduce(
    (sum, val) => sum + val,
    0
  );

  //useremail
  const getUserDisplayName = () => {
    if (!user) return "";

    //username
    if (user.name) {
      return user.name.split(" ")[0];
    }

    //(before @ symbol)
    if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  return (
    <Layout>
      {/* Welcome*/}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {user
            ? `Welcome back, ${getUserDisplayName()}!`
            : "Analytics Dashboard"}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track feature usage and explore powerful API documentation tools
        </p>
      </div>

      {/* Stats overview*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatsCard
          icon={Users}
          title="Total Registered Users"
          value={globalStats.total_users?.toLocaleString() || "0"}
          color="blue"
        />
        <StatsCard
          icon={BarChart3}
          title="Global API Calls"
          value={globalTotal.toLocaleString()}
          color="green"
        />
        <StatsCard
          icon={TrendingUp}
          title={user ? "Your API Calls" : "Average Usage"}
          value={user ? userTotal.toString() : "47"}
          color="purple"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <PieChart
          data={globalStats.feature_usage || {}}
          title="Global Feature Usage"
          subtitle="Across all users worldwide"
        />
        {user ? (
          <PieChart
            data={userStats}
            title="Your Feature Usage"
            subtitle="Your personal statistics"
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Personal Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Sign in to view your usage statistics
              </p>
              <button
                onClick={loginWithGoogle}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/*Quick Actions */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uploadOptions.map((option) => {
            const IconComponent = option.icon;
            const featureUsage = globalStats.feature_usage?.[option.id] || 0;
            const userUsage = userStats[option.id] || 0;

            return (
              <div
                key={option.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer transform hover:scale-105"
                onClick={() => handleFeatureClick(option.id, option.path)}
              >
                <div
                  className={`bg-gradient-to-r ${option.color} p-6 text-white relative`}
                >
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="relative flex items-center">
                    <IconComponent className="w-8 h-8 mr-4" />
                    <div>
                      <h4 className="text-xl font-bold">{option.title}</h4>
                      <p className="text-sm opacity-90">{option.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {user
                        ? `Used ${userUsage} times`
                        : "Click to get started"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {globalTotal > 0
                        ? ((featureUsage / globalTotal) * 100).toFixed(1)
                        : 0}
                      % of global usage
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
