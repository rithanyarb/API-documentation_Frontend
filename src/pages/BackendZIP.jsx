// === src/pages/BackendZIP.jsx ===
import React, { useState } from "react";
import Layout from "../components/Layout";
import DocumentationActions from "../components/DocumentationActions";
import { uploadBackendZip } from "../api";
import { Upload, FileCode, Loader2 } from "lucide-react";

export default function BackendZIP() {
  const [zipFile, setZipFile] = useState(null);
  const [zipFormat, setZipFormat] = useState("json");
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!zipFile) {
      setError("Please select a ZIP file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await uploadBackendZip(zipFile, zipFormat);
      setGeneratedDoc({
        content: response.data,
        format: response.format || zipFormat,
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
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Backend ZIP</h2>
              <p className="text-gray-600">Upload backend code as ZIP file</p>
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
                ZIP File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileCode className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {zipFile ? zipFile.name : "Click to upload ZIP file"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => setZipFile(e.target.files[0])}
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
                    className="mr-2"
                  />
                  YAML
                </label>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!zipFile || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                zipFile && !loading
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
            <DocumentationActions generatedDoc={generatedDoc} />
          </div>
        )}
      </div>
    </Layout>
  );
}
