// === src/pages/GitHubRepository.jsx ===
import React, { useState } from "react";
import Layout from "../components/Layout";
import DocumentationActions from "../components/DocumentationActions";
import { uploadGithubRepo } from "../api";
import { Github, Loader2 } from "lucide-react";

export default function GitHubRepository() {
  const [githubUrl, setGithubUrl] = useState("");
  const [githubFormat, setGithubFormat] = useState("json");
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!githubUrl) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await uploadGithubRepo(githubUrl, githubFormat);
      setGeneratedDoc({
        content: response.data,
        format: response.format || githubFormat,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 rounded-lg mr-4">
              <Github className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                GitHub Repository
              </h2>
              <p className="text-gray-600">
                Clone and analyze GitHub repository
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <input
                type="text"
                placeholder="https://github.com/username/repository.git"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="githubFormat"
                    value="json"
                    checked={githubFormat === "json"}
                    onChange={(e) => setGithubFormat(e.target.value)}
                    className="mr-2"
                  />
                  JSON
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="githubFormat"
                    value="yaml"
                    checked={githubFormat === "yaml"}
                    onChange={(e) => setGithubFormat(e.target.value)}
                    className="mr-2"
                  />
                  YAML
                </label>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!githubUrl || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                githubUrl && !loading
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing... Don't Switch Tabs
                </>
              ) : (
                "Upload & Generate"
              )}
            </button>
          </div>
        </div>

        {generatedDoc && (
          <div className="mt-8">
            <DocumentationActions generatedDoc={generatedDoc} />
          </div>
        )}
      </div>
    </Layout>
  );
}
