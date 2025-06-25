// === src/pages/GitHubRepository.jsx ===
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import DocumentationActions from "../components/DocumentationActions";
import { uploadGithubRepo, getCodeLimits, validateRepoUrl } from "../api";
import {
  Github,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
} from "lucide-react";

export default function GitHubRepository() {
  const [githubUrl, setGithubUrl] = useState("");
  const [githubFormat, setGithubFormat] = useState("json");
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [limits, setLimits] = useState({ max_repo_size_mb: 500 });
  const [urlValidation, setUrlValidation] = useState({
    valid: null,
    message: "",
  });

  useEffect(() => {
    fetchLimits();
  }, []);

  useEffect(() => {
    //URL check
    const timer = setTimeout(() => {
      if (githubUrl.trim()) {
        validateRepoUrlAsync(githubUrl);
      } else {
        setUrlValidation({ valid: null, message: "" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [githubUrl]);

  const fetchLimits = async () => {
    try {
      const limitsData = await getCodeLimits();
      setLimits(limitsData);
    } catch (error) {
      console.error("Failed to fetch limits:", error);
    }
  };

  const validateRepoUrlAsync = async (url) => {
    try {
      const result = await validateRepoUrl(url);
      setUrlValidation(result);
    } catch (error) {
      setUrlValidation({
        valid: false,
        message: "Unable to validate URL",
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidUrl = () => {
    return githubUrl.trim() && urlValidation.valid === true;
  };

  const handleUpload = async () => {
    if (!isValidUrl()) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);
    setUploadStatus("Validating repository...");

    try {
      //steps
      const progressSteps = [
        { step: 10, message: "Cloning repository..." },
        { step: 30, message: "Analyzing repository size..." },
        { step: 50, message: "Extracting Python files..." },
        { step: 70, message: "Processing code..." },
        { step: 90, message: "Generating documentation..." },
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setUploadProgress(progressSteps[currentStep].step);
          setUploadStatus(progressSteps[currentStep].message);
          currentStep++;
        }
      }, 1000);

      const response = await uploadGithubRepo(githubUrl, githubFormat);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus("Analysis complete!");

      const metadata = {
        repoSize: response.headers?.["x-repo-size"] || "Unknown",
        filesProcessed: response.headers?.["x-files-processed"] || "Unknown",
        totalLines: response.headers?.["x-total-lines"] || "Unknown",
        codeTruncated: response.headers?.["x-code-truncated"] === "true",
      };

      setGeneratedDoc({
        content: response.data,
        format: response.format || githubFormat,
        metadata: metadata,
        sourceUrl: githubUrl,
      });

      //Success message
      setTimeout(() => {
        setUploadStatus("");
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      setUploadStatus("");
      setUploadProgress(0);

      //Handle error types
      if (
        error.message.includes("413") ||
        error.message.includes("too large")
      ) {
        setError(
          `Repository too large. Maximum size allowed: ${limits.max_repo_size_mb}MB`
        );
      } else if (error.message.includes("404")) {
        setError(
          "Repository not found. Please check the URL and ensure the repository is public."
        );
      } else if (error.message.includes("403")) {
        setError(
          "Access denied. The repository might be private or you don't have permission to access it."
        );
      } else if (
        error.message.includes("408") ||
        error.message.includes("timeout")
      ) {
        setError(
          "Repository cloning timed out. The repository might be too large or network is slow."
        );
      } else if (error.message.includes("400")) {
        setError(
          "Invalid repository URL or the repository doesn't contain Python code."
        );
      } else {
        setError(
          error.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getUrlInputClassName = () => {
    let baseClass =
      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ";

    if (!githubUrl.trim()) {
      return baseClass + "border-gray-300 focus:ring-gray-500";
    } else if (urlValidation.valid === true) {
      return baseClass + "border-green-300 bg-green-50 focus:ring-green-500";
    } else if (urlValidation.valid === false) {
      return baseClass + "border-red-300 bg-red-50 focus:ring-red-500";
    } else {
      return baseClass + "border-yellow-300 bg-yellow-50 focus:ring-yellow-500";
    }
  };

  const isValidForUpload = isValidUrl() && !loading;

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
              <p className="text-sm text-gray-500 mt-1">
                Maximum size: {limits.max_repo_size_mb}MB | Timeout: 5 minutes |
                Python files only
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {uploadStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Info className="w-5 h-5 text-blue-500 mr-2" />
                <p className="text-blue-700 font-medium">{uploadStatus}</p>
              </div>
              {uploadProgress > 0 && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://github.com/username/repository.git"
                  className={getUrlInputClassName()}
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {githubUrl.trim() && urlValidation.valid === true && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {githubUrl.trim() && urlValidation.valid === false && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              {urlValidation.message && (
                <p
                  className={`mt-2 text-sm ${
                    urlValidation.valid === true
                      ? "text-green-600"
                      : urlValidation.valid === false
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {urlValidation.message}
                </p>
              )}

              <div className="mt-2 text-sm text-gray-500">
                <p>Supported formats:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>https://github.com/username/repository</li>
                  <li>https://github.com/username/repository.git</li>
                </ul>
              </div>
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
                    disabled={loading}
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
                    disabled={loading}
                    className="mr-2"
                  />
                  YAML
                </label>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!isValidForUpload}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                isValidForUpload
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
                "Clone & Generate"
              )}
            </button>
          </div>
        </div>

        {generatedDoc && (
          <div className="mt-8">
            {generatedDoc.metadata &&
              generatedDoc.metadata.filesProcessed !== "Unknown" &&
              generatedDoc.metadata.totalLines !== "Unknown" && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">
                      Analysis Summary
                    </h4>
                    {generatedDoc.sourceUrl && (
                      <a
                        href={generatedDoc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        View Repository{" "}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Repository size:{" "}
                      {formatFileSize(
                        parseInt(generatedDoc.metadata.repoSize) || 0
                      )}
                    </p>
                    <p>
                      Files processed: {generatedDoc.metadata.filesProcessed}
                    </p>
                    <p>
                      Total lines analyzed: {generatedDoc.metadata.totalLines}
                    </p>
                    {generatedDoc.metadata.codeTruncated && (
                      <p className="text-amber-600">
                        Code was truncated due to size limits
                      </p>
                    )}
                  </div>
                </div>
              )}
            <DocumentationActions generatedDoc={generatedDoc} />
          </div>
        )}
      </div>
    </Layout>
  );
}
