// === src/components/LoginScreen.jsx ===
import React from "react";
import { Chrome, Globe, Zap, Shield, Users } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL;

const LoginScreen = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/api/v1/authentication/login`;
  };

  const features = [
    {
      icon: Globe,
      title: "OpenAPI JSON",
      description: "Upload OpenAPI specifications directly",
    },
    {
      icon: Zap,
      title: "cURL Commands",
      description: "Convert cURL commands to documentation",
    },
    {
      icon: Users,
      title: "Backend Analysis",
      description: "Upload ZIP files for automatic API discovery",
    },
    {
      icon: Shield,
      title: "GitHub Integration",
      description: "Connect repositories for seamless docs",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Main Login Card*/}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side-Login Form */}
            <div className="p-12 flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    API Docs
                  </h1>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to access your API documentation workspace
                </p>
              </div>

              {/* Google Authentication */}
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 group"
                >
                  <Chrome className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>

            {/* Right Side-Features */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white">
              <h2 className="text-2xl font-bold mb-8">
                Transform Your APIs Into Beautiful Documentation
              </h2>

              <div className="space-y-6">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-blue-100 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
