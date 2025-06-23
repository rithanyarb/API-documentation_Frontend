// === src/components/EndpointCard.jsx ===
import React, { useState } from "react";
import {
  Shield,
  Code,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";

const methodColors = {
  GET: "bg-blue-100 text-blue-800 border-blue-200",
  POST: "bg-green-100 text-green-800 border-green-200",
  PUT: "bg-orange-100 text-orange-800 border-orange-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
  PATCH: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function EndpointCard({ data, onTest, isLoading, testResult }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return "text-green-600";
    if (statusCode >= 400 && statusCode < 500) return "text-orange-600";
    if (statusCode >= 500) return "text-red-600";
    return "text-gray-600";
  };

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const formatResponseBody = (responseBody) => {
    if (!responseBody) return null;

    try {
      if (typeof responseBody === "string") {
        return JSON.parse(responseBody);
      }
      return responseBody;
    } catch (error) {
      return responseBody;
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
      <div className="p-6">
        {/* Method and URL */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full border ${
              methodColors[data.method] ||
              "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {data.method}
          </span>
          <code className="text-lg font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded-lg flex-1 break-all">
            {data.url}
          </code>
          <button
            onClick={onTest}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Testing..." : "Test"}
          </button>
        </div>

        {/* Summary and Description */}
        {data.summary && (
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            {data.summary}
          </h4>
        )}
        {data.description && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {data.description}
          </p>
        )}

        {/* Test Result */}
        {testResult && (
          <div className="mb-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {testResult.error ? (
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                )}
                <span className="font-semibold">
                  {testResult.error ? "Test Failed" : "Test Successful"}
                </span>
                {testResult.status_code && (
                  <span
                    className={`ml-2 text-sm font-mono px-2 py-1 rounded ${getStatusColor(
                      testResult.status_code
                    )} bg-gray-100`}
                  >
                    {testResult.status_code}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowResponse(!showResponse)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                {showResponse ? "Hide" : "Show"} Response
                {showResponse ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>

            {/* Response body*/}
            {testResult.response_body && !showResponse && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-sm font-semibold text-gray-700">
                    Response Body
                  </h6>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        typeof testResult.response_body === "string"
                          ? testResult.response_body
                          : JSON.stringify(
                              formatResponseBody(testResult.response_body),
                              null,
                              2
                            ),
                        "response_body"
                      )
                    }
                    className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copiedSection === "response_body" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto max-h-64 overflow-y-auto">
                  <pre>
                    {JSON.stringify(
                      formatResponseBody(testResult.response_body),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}

            {showResponse && (
              <div className="space-y-4">
                {/* Error Message */}
                {testResult.error && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="text-sm font-semibold text-red-700">
                        Error
                      </h6>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                      {testResult.error}
                    </div>
                  </div>
                )}

                {/* Response Body */}
                {testResult.response_body && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="text-sm font-semibold text-gray-700">
                        Response Body
                      </h6>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            typeof testResult.response_body === "string"
                              ? testResult.response_body
                              : JSON.stringify(
                                  formatResponseBody(testResult.response_body),
                                  null,
                                  2
                                ),
                            "response_body"
                          )
                        }
                        className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {copiedSection === "response_body" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                      <pre>
                        {JSON.stringify(
                          formatResponseBody(testResult.response_body),
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Response Headers */}
                {testResult.response_headers && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="text-sm font-semibold text-gray-700">
                        Response Headers
                      </h6>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(
                              testResult.response_headers,
                              null,
                              2
                            ),
                            "response_headers"
                          )
                        }
                        className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {copiedSection === "response_headers"
                          ? "Copied!"
                          : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <pre className="text-gray-800">
                        {JSON.stringify(testResult.response_headers, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Request Details */}
                {(testResult.request_url || testResult.method) && (
                  <div>
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">
                      Request Details
                    </h6>
                    <div className="bg-blue-50 p-3 rounded text-sm">
                      <div className="space-y-1">
                        {testResult.method && (
                          <div>
                            <span className="font-medium text-blue-800">
                              Method:
                            </span>
                            <span className="ml-2 text-blue-700">
                              {testResult.method}
                            </span>
                          </div>
                        )}
                        {testResult.request_url && (
                          <div>
                            <span className="font-medium text-blue-800">
                              URL:
                            </span>
                            <span className="ml-2 text-blue-700 font-mono break-all">
                              {testResult.request_url}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw Response (for debugging) */}
                <details className="group">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                    Show Raw Response (Debug)
                  </summary>
                  <div className="mt-2 bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {/* Tags and Auth */}
        <div className="flex flex-wrap gap-2 mb-4">
          {data.headers?.Authorization && (
            <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4 mr-1" />
              Auth Required
            </div>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200"
          >
            <Code className="w-4 h-4 mr-1" />
            {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div className="space-y-4 border-t pt-4">
            {/* Headers */}
            {data.headers && Object.keys(data.headers).length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Headers
                </h5>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-sm text-gray-800">
                    {JSON.stringify(data.headers, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Request Body */}
            {data.body && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Request Body
                </h5>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{JSON.stringify(data.body, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
