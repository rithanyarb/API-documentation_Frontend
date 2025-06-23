// === src/components/EditableEndpointCard.jsx ===
import React, { useState, useEffect } from "react";
import {
  Play,
  Copy,
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const EditableEndpointCard = ({
  data,
  originalData,
  onEdit,
  onTest,
  isLoading,
  testResult,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [copiedField, setCopiedField] = useState(null);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  useEffect(() => {
    if (testResult && !testResult.error) {
      setShowResponse(true);
    }
  }, [testResult]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const finalData = {
      ...editedData,
      body: editedData.body ? getParsedBody(editedData.body) : editedData.body,
    };
    onEdit(finalData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedData(originalData);
    onEdit(originalData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHeaderChange = (key, value) => {
    setEditedData((prev) => ({
      ...prev,
      headers: {
        ...prev.headers,
        [key]: value,
      },
    }));
  };

  const handleBodyChange = (value) => {
    setEditedData((prev) => ({
      ...prev,
      body: value,
    }));
  };

  const getParsedBody = (body) => {
    if (typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch (error) {
        return body;
      }
    }
    return body;
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400) return "text-red-600";
    return "text-yellow-600";
  };

  const getStatusIcon = (status) => {
    if (status >= 200 && status < 300)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status >= 400) return <XCircle className="w-5 h-5 text-red-600" />;
    return <XCircle className="w-5 h-5 text-yellow-600" />;
  };

  const formatJson = (obj) => {
    if (typeof obj === "string") {
      try {
        const parsed = JSON.parse(obj);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return obj;
      }
    }
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const formatResponseBody = (responseBody) => {
    if (!responseBody) return null;

    try {
      if (typeof responseBody === "string") {
        const parsed = JSON.parse(responseBody);
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(responseBody, null, 2);
    } catch (error) {
      return responseBody;
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      {/* Header with edit controls */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                editedData.method === "GET"
                  ? "bg-blue-100 text-blue-800"
                  : editedData.method === "POST"
                  ? "bg-green-100 text-green-800"
                  : editedData.method === "PUT"
                  ? "bg-yellow-100 text-yellow-800"
                  : editedData.method === "DELETE"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {editedData.method}
            </span>
            {editedData.requires_auth && (
              <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                🔒 Auth Required
              </span>
            )}
            {isEditing ? (
              <input
                type="text"
                value={editedData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm font-mono"
              />
            ) : (
              <code className="text-sm bg-gray-50 px-2 py-1 rounded font-mono flex-1">
                {editedData.url}
              </code>
            )}
            <button
              onClick={() => copyToClipboard(editedData.url, "url")}
              className="p-1 hover:bg-gray-100 rounded"
              title="Copy URL"
            >
              {copiedField === "url" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={editedData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              rows="2"
              placeholder="Endpoint summary..."
            />
          ) : (
            <p className="text-gray-600 text-sm">{editedData.summary}</p>
          )}

          {/* Auth reminder */}
          {editedData.requires_auth && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Auth Tip:</strong> Replace "YOUR_ACCESS_TOKEN_HERE" in
                the Authorization header with your actual token before testing.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit endpoint"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onTest}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Test
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Reset to original"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Headers */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Headers</h4>
        <div className="bg-gray-50 rounded-lg p-3">
          {isEditing ? (
            <div className="space-y-2">
              {Object.entries(editedData.headers || {}).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    readOnly
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-gray-100"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleHeaderChange(key, e.target.value)}
                    className="flex-2 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {Object.entries(editedData.headers || {}).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="font-semibold text-gray-600">{key}:</span>
                  <span className="text-gray-800 font-mono">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Body */}
      {editedData.body && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Request Body
            </h4>
            <button
              onClick={() =>
                copyToClipboard(formatJson(editedData.body), "body")
              }
              className="p-1 hover:bg-gray-100 rounded"
              title="Copy body"
            >
              {copiedField === "body" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            {isEditing ? (
              <textarea
                value={
                  typeof editedData.body === "string"
                    ? editedData.body
                    : formatJson(editedData.body)
                }
                onChange={(e) => handleBodyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs font-mono"
                rows="6"
                placeholder="Request body (JSON)..."
              />
            ) : (
              <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {formatJson(editedData.body)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Test Results Section */}
      {testResult && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResult.status_code)}
              <h4 className="text-sm font-semibold text-gray-700">
                Test Result
              </h4>
              <span
                className={`text-sm font-semibold ${getStatusColor(
                  testResult.status_code
                )}`}
              >
                {testResult.status_code}
              </span>
            </div>
            {testResult.response_body && (
              <button
                onClick={() => setShowResponse(!showResponse)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                {showResponse ? "Hide" : "Show"} Details
                {showResponse ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
            )}
          </div>

          {testResult.error ? (
            <div className="text-red-600 text-sm">
              <strong>Error:</strong> {testResult.error}
            </div>
          ) : (
            <>
              {/* RESPONSE BODY */}
              {testResult.response_body && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm text-gray-700">
                      Response Body:
                    </strong>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          formatResponseBody(testResult.response_body),
                          "response"
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy response"
                    >
                      {copiedField === "response" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto max-h-64 overflow-y-auto">
                    <pre>{formatResponseBody(testResult.response_body)}</pre>
                  </div>
                </div>
              )}

              {/* ADDITIONAL DETAILS */}
              {showResponse && (
                <div className="space-y-4">
                  {testResult.response_time && (
                    <div className="text-sm text-gray-600">
                      <strong>Response Time:</strong> {testResult.response_time}
                      ms
                    </div>
                  )}

                  {testResult.response_headers && (
                    <div>
                      <strong className="text-sm text-gray-700 block mb-2">
                        Response Headers:
                      </strong>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <pre className="text-gray-800">
                          {JSON.stringify(testResult.response_headers, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {(testResult.request_url || testResult.method) && (
                    <div>
                      <strong className="text-sm text-gray-700 block mb-2">
                        Request Details:
                      </strong>
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
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableEndpointCard;
