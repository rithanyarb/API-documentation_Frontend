// === src/pages/OpenAPIJSON.jsx ===
import React, { useState } from "react";
import Layout from "../components/Layout";
import DocumentationActions from "../components/DocumentationActions";
import TemplatesDisplay from "../components/TemplatesDisplay";
import { uploadOpenAPI, uploadOpenAPIFile, fetchTemplates } from "../api";
import { Globe, Upload, Loader2 } from "lucide-react";

export default function OpenAPIJSON() {
  // URL Upload
  const [baseUrl, setBaseUrl] = useState("");
  const [openapiUrl, setOpenapiUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  // File Upload
  const [fileBaseUrl, setFileBaseUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  // Shared State
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");

  const handleUrlUpload = async () => {
    if (!baseUrl || !openapiUrl) {
      setError("Please fill in both Base URL and OpenAPI JSON URL");
      return;
    }

    setUrlLoading(true);
    setError("");

    try {
      const response = await uploadOpenAPI({
        openapi_url: openapiUrl,
        base_url: baseUrl,
      });

      if (response.project_id) {
        const templatesResponse = await fetchTemplates(response.project_id);
        setTemplates(templatesResponse);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setFileLoading(true);
    setError("");

    try {
      const response = await uploadOpenAPIFile(selectedFile, fileBaseUrl);

      if (response.project_id) {
        const templatesResponse = await fetchTemplates(response.project_id);
        setTemplates(templatesResponse);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setFileLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [".json", ".yaml", ".yml"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (!validTypes.includes(fileExtension)) {
        setError("Please select a valid JSON or YAML file");
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">OpenAPI Upload</h2>
            <p className="text-gray-600 mt-2">
              Choose your preferred method to upload OpenAPI specification, Keep
              your BackendURL is running
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* URL Upload Section */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg mr-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">From URL</h3>
                  <p className="text-gray-600 text-sm">
                    Upload from OpenAPI URL or .json/.yaml file
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., https://localhost"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAPI JSON URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://localhost/openapi.json"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={openapiUrl}
                    onChange={(e) => setOpenapiUrl(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleUrlUpload}
                  disabled={!baseUrl || !openapiUrl || urlLoading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                    baseUrl && openapiUrl && !urlLoading
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {urlLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing... Don't Switch Tabs
                    </>
                  ) : (
                    "Upload from URL"
                  )}
                </button>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg mr-4">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">From File</h3>
                  <p className="text-gray-600 text-sm">
                    Upload JSON or YAML file
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., https://localhost"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={fileBaseUrl}
                    onChange={(e) => setFileBaseUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAPI File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json,.yaml,.yml"
                      onChange={handleFileSelect}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || fileLoading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                    selectedFile && !fileLoading
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {fileLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing... Don't Switch Tabs
                    </>
                  ) : (
                    "Upload File"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {templates.length > 0 && (
          <div className="mt-8">
            <TemplatesDisplay templates={templates} />
          </div>
        )}
      </div>
    </Layout>
  );
}
