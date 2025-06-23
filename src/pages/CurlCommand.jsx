// === src/pages/CurlCommand.jsx ===
import React, { useState } from "react";
import Layout from "../components/Layout";
import TemplatesDisplay from "../components/TemplatesDisplay";
import { uploadCurl, fetchTemplates } from "../api";
import { Terminal, Loader2 } from "lucide-react";

export default function CurlCommand() {
  const [curl, setCurl] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");

  const formatCurlInput = (curlInput) => {
    let cleaned = curlInput.replace(/\\\n/g, "").replace(/\n/g, " ");

    const dataMatch =
      cleaned.match(/-d\s+'([\s\S]*?)'/) || cleaned.match(/-d\s+'([\s\S]*)/);

    if (dataMatch) {
      try {
        const parsedJson = JSON.parse(dataMatch[1]);
        const compactJson = JSON.stringify(parsedJson);
        cleaned = cleaned.replace(
          /-d\s+'([\s\S]*?)'?(\s|$)/,
          `-d '${compactJson}' `
        );
      } catch (e) {
        console.warn("Failed to parse JSON inside -d:", e);
      }
    }

    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
    return cleaned;
  };

  const handleFormatCurl = () => {
    const formatted = formatCurlInput(curl);
    setCurl(formatted);
  };

  const handleUpload = async () => {
    if (!curl) {
      setError("Please enter a cURL command");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await uploadCurl({ curl });

      if (response.project_id) {
        const templatesResponse = await fetchTemplates(response.project_id);
        setTemplates(templatesResponse);
      }
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
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg mr-4">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">cURL Command</h2>
              <p className="text-gray-600">Generate from cURL command</p>
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
                cURL Command
              </label>
              <textarea
                placeholder="Paste your cURL command here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={6}
                value={curl}
                onChange={(e) => setCurl(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleFormatCurl}
                disabled={!curl}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Format cURL
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={!curl || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                curl && !loading
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:-translate-y-0.5"
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

        {templates.length > 0 && (
          <div className="mt-8">
            <TemplatesDisplay templates={templates} />
          </div>
        )}
      </div>
    </Layout>
  );
}
