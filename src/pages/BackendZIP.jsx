// === src/pages/BackendZIP.jsx ===
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import DocumentationActions from "../components/DocumentationActions";
import { uploadBackendZip, getCodeLimits } from "../api";
import {
  Upload,
  FileCode,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

export default function BackendZIP() {
  const [zipFile, setZipFile] = useState(null);
  const [zipFormat, setZipFormat] = useState("json");
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [limits, setLimits] = useState({ max_zip_size_mb: 100 });

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const limitsData = await getCodeLimits();
      setLimits(limitsData);
    } catch (error) {
      console.error("Failed to fetch limits:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    if (!file) return "Please select a file";

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return "Only ZIP files are allowed";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${
        limits.max_zip_size_mb
      }MB, your file: ${formatFileSize(file.size)}`;
    }

    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setError("");

    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setZipFile(null);
        e.target.value = "";
        return;
      }
      setZipFile(file);
    } else {
      setZipFile(null);
    }
  };

  const handleUpload = async () => {
    const validationError = validateFile(zipFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);
    setUploadStatus("Uploading file...");

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      setUploadStatus("Processing ZIP file...");

      const response = await uploadBackendZip(zipFile, zipFormat);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus("Analysis complete!");

      const metadata = {
        filesProcessed: response.headers?.["x-files-processed"] || "Unknown",
        totalLines: response.headers?.["x-total-lines"] || "Unknown",
        codeTruncated: response.headers?.["x-code-truncated"] === "true",
      };

      setGeneratedDoc({
        content: response.data,
        format: response.format || zipFormat,
        metadata: metadata,
      });

      //success message
      setTimeout(() => {
        setUploadStatus("");
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      setUploadStatus("");
      setUploadProgress(0);

      //handle error types
      if (
        error.message.includes("413") ||
        error.message.includes("too large")
      ) {
        setError(
          `File too large. Maximum size allowed: ${limits.max_zip_size_mb}MB`
        );
      } else if (error.message.includes("400")) {
        setError(
          "Invalid file format or content. Please ensure you're uploading a valid ZIP file with Python code."
        );
      } else if (error.message.includes("timeout")) {
        setError(
          "Upload timed out. The file might be too large or processing is taking too long."
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

  const isValidForUpload = zipFile && !loading && !validateFile(zipFile);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Backend ZIP</h2>
              <p className="text-gray-600">Upload backend code as ZIP file</p>
              <p className="text-sm text-gray-500 mt-1">
                Maximum size: {limits.max_zip_size_mb}MB | Supported: Python
                files only
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
                ZIP File
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    zipFile
                      ? validateFile(zipFile)
                        ? "border-red-300 bg-red-50 hover:bg-red-100"
                        : "border-green-300 bg-green-50 hover:bg-green-100"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {zipFile ? (
                      validateFile(zipFile) ? (
                        <AlertCircle className="w-8 h-8 mb-2 text-red-400" />
                      ) : (
                        <CheckCircle className="w-8 h-8 mb-2 text-green-400" />
                      )
                    ) : (
                      <FileCode className="w-8 h-8 mb-2 text-gray-400" />
                    )}
                    <p className="text-sm text-gray-500 text-center">
                      {zipFile ? (
                        <>
                          <span className="font-medium">{zipFile.name}</span>
                          <br />
                          <span>Size: {formatFileSize(zipFile.size)}</span>
                        </>
                      ) : (
                        "Click to upload ZIP file"
                      )}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={loading}
                  />
                </label>
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
                    name="zipFormat"
                    value="json"
                    checked={zipFormat === "json"}
                    onChange={(e) => setZipFormat(e.target.value)}
                    disabled={loading}
                    className="mr-2"
                  />
                  JSON
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="zipFormat"
                    value="yaml"
                    checked={zipFormat === "yaml"}
                    onChange={(e) => setZipFormat(e.target.value)}
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
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5"
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
            {generatedDoc.metadata &&
              generatedDoc.metadata.filesProcessed !== "Unknown" &&
              generatedDoc.metadata.totalLines !== "Unknown" && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Analysis Summary
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
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
