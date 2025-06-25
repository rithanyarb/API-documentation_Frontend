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
  AlertTriangle,
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
  const [parameterValues, setParameterValues] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [showTryItOut, setShowTryItOut] = useState(false);

  useEffect(() => {
    setEditedData(data);
    if (data.parameters) {
      const initialValues = {};
      data.parameters.forEach((param) => {
        if (param.in === "path") {
          initialValues[param.name] =
            param.schema?.type === "integer" ? "1" : "sample_value";
        } else {
          initialValues[param.name] = "";
        }
      });
      setParameterValues(initialValues);
    }
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
    console.log("handleSave called with editedData:", editedData);
    const finalData = {
      ...editedData,
      body: editedData.body ? getParsedBody(editedData.body) : editedData.body,
    };
    console.log("Saving finalData:", finalData);
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

  const handleParameterChange = (paramName, value) => {
    setParameterValues((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const buildUrlWithParameters = () => {
    let url = editedData.url;
    const queryParams = [];

    if (editedData.parameters) {
      editedData.parameters.forEach((param) => {
        const value = parameterValues[param.name];
        if (value) {
          if (param.in === "path") {
            url = url
              .replace(`{${param.name}}`, value)
              .replace(`{sample_${param.name}}`, value);
          } else if (param.in === "query") {
            queryParams.push(`${param.name}=${encodeURIComponent(value)}`);
          }
        }
      });
    }

    if (queryParams.length > 0) {
      url += (url.includes("?") ? "&" : "?") + queryParams.join("&");
    }

    return url;
  };

  const handleTestWithParameters = () => {
    const updatedTemplate = {
      ...editedData,
      url: buildUrlWithParameters(),
    };
    console.log("Testing with parameters:", updatedTemplate);
    onTest(updatedTemplate);
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

  const getMethodColor = (method) => {
    const colors = {
      GET: "bg-blue-100 text-blue-800",
      POST: "bg-green-100 text-green-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800",
    };
    return colors[method] || "bg-gray-100 text-gray-800";
  };

  const hasParameters =
    editedData.parameters && editedData.parameters.length > 0;
  const hasBody = editedData.body;
  const isParameterMethod = ["GET", "DELETE"].includes(editedData.method);
  const isBodyMethod = ["POST", "PUT", "PATCH"].includes(editedData.method);

  const shouldUseParameterInterface = hasParameters && !hasBody;
  const shouldUseDirectTest = hasBody || (!hasParameters && !hasBody);

  //Debug
  console.log(`Endpoint ${editedData.method} ${editedData.url}:`);
  console.log(`- hasParameters: ${hasParameters}`);
  console.log(`- hasBody: ${hasBody}`);
  console.log(`- shouldUseParameterInterface: ${shouldUseParameterInterface}`);
  console.log(`- shouldUseDirectTest: ${shouldUseDirectTest}`);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-50 border-b">
        <span
          className={`px-3 py-1 rounded text-sm font-semibold mr-4 ${getMethodColor(
            editedData.method
          )}`}
        >
          {editedData.method}
        </span>
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              className="text-lg font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1 w-full"
            />
          ) : (
            <h3 className="text-lg font-semibold text-gray-800">
              {editedData.url}
            </h3>
          )}
          {isEditing ? (
            <textarea
              value={editedData.summary}
              onChange={(e) => handleInputChange("summary", e.target.value)}
              className="text-gray-600 text-sm border border-gray-300 rounded px-2 py-1 w-full mt-1"
              rows="2"
            />
          ) : (
            <p className="text-gray-600 text-sm">{editedData.summary}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit endpoint"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {shouldUseDirectTest && (
                <button
                  onClick={() => {
                    console.log("Test button clicked, editedData:", editedData);
                    console.log("editedData.body:", editedData.body);
                    console.log(
                      "typeof editedData.body:",
                      typeof editedData.body
                    );

                    const testData = { ...editedData };

                    if (testData.body && typeof testData.body === "string") {
                      try {
                        testData.body = JSON.parse(testData.body);
                      } catch (e) {
                        console.warn(
                          "Could not parse body as JSON, sending as string:",
                          testData.body
                        );
                      }
                    }

                    console.log("Sending testData:", testData);
                    onTest(testData);
                  }}
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
              )}
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

      {/* Content*/}
      <div className="p-6 bg-white">
        {shouldUseDirectTest && (
          <div className="mb-6">
            {/* URLwarning */}
            {editedData.url && !editedData.url.startsWith("http") && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <strong>URL Warning:</strong> The URL appears to be relative.
                  Make sure to include the full URL with protocol (http:// or
                  https://) and host for testing to work properly.
                </div>
              </div>
            )}

            {/* Auth reminder*/}
            {editedData.requires_auth && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Auth Required:</strong> Replace
                  "YOUR_ACCESS_TOKEN_HERE" in the Authorization header with your
                  actual token before testing.
                </p>
              </div>
            )}

            {/* Headers Section */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">
                Headers
              </h5>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="space-y-2">
                  {Object.entries(editedData.headers || {}).map(
                    ([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={key}
                          readOnly
                          className="px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
                          placeholder="Header name"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            console.log(
                              `Header ${key} changed to:`,
                              e.target.value
                            );
                            handleHeaderChange(key, e.target.value);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Header value"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/*request Body*/}
            {hasBody && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-700">
                    Request Body
                  </h5>
                  <button
                    onClick={() =>
                      copyToClipboard(formatJson(editedData.body), "body")
                    }
                    className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copiedField === "body" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-white rounded border p-3">
                  <textarea
                    value={
                      typeof editedData.body === "string"
                        ? editedData.body
                        : formatJson(editedData.body)
                    }
                    onChange={(e) => {
                      console.log("Body changed to:", e.target.value);
                      handleBodyChange(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="8"
                    placeholder="Request body (JSON)..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Media type:{" "}
                      {editedData.headers?.["Content-Type"] ||
                        "application/json"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/*Parameters interface*/}
        {shouldUseParameterInterface && (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <button
                  onClick={() => setShowTryItOut(!showTryItOut)}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
                >
                  {showTryItOut ? "Cancel" : "Try it out"}
                </button>
              </div>

              {showTryItOut && (
                <div className="space-y-6">
                  {/*URL check for parameter interface*/}
                  {editedData.url && !editedData.url.startsWith("http") && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <strong>URL Warning:</strong> The URL appears to be
                        relative. Make sure to include the full URL with
                        protocol (http:// or https://) and host for testing to
                        work properly.
                      </div>
                    </div>
                  )}

                  {/* Parameters Section */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">
                      Parameters
                    </h5>

                    {/* Parameters Table Header */}
                    <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-700 border-b pb-2 mb-4">
                      <div>Name</div>
                      <div>Description</div>
                    </div>

                    {/* Parameters List */}
                    <div className="space-y-4 mb-4">
                      {editedData.parameters.map((param, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 gap-4 items-start"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-800">
                                {param.name}
                                {param.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                {param.schema?.type || "string"}
                              </span>
                              <span className="ml-2 italic">({param.in})</span>
                            </div>
                          </div>

                          <div>
                            <input
                              type={
                                param.schema?.type === "integer"
                                  ? "number"
                                  : "text"
                              }
                              placeholder={`Enter ${param.name}${
                                param.required ? " (required)" : ""
                              }`}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={parameterValues[param.name] || ""}
                              onChange={(e) =>
                                handleParameterChange(
                                  param.name,
                                  e.target.value
                                )
                              }
                            />
                            {param.required && !parameterValues[param.name] && (
                              <p className="text-red-500 text-xs mt-1">
                                This field is required
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={handleTestWithParameters}
                      disabled={isLoading}
                      className="flex items-center bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mb-4"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Execute
                    </button>

                    {/* Request URL*/}
                    <div className="p-3 bg-gray-100 rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          Request URL:
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              buildUrlWithParameters(),
                              "request_url"
                            )
                          }
                          className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {copiedField === "request_url" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <code className="text-blue-600 break-all">
                        {buildUrlWithParameters()}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/*responses section*/}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Responses</h4>

          {/*Responsedocumentation*/}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">200</span>
                    <span>Successful Response</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-sm font-medium">Media type: </span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    application/json
                  </span>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                  <pre>"string"</pre>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">422</span>
                    <span>Validation Error</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-sm font-medium">Media type: </span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    application/json
                  </span>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                  <pre>
                    {JSON.stringify(
                      {
                        detail: [
                          {
                            loc: ["string", 0],
                            msg: "string",
                            type: "string",
                          },
                        ],
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*Testing section*/}
        {testResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {testResult.status_code === 0 ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  getStatusIcon(testResult.status_code)
                )}
                <h4 className="text-sm font-semibold text-gray-700">
                  Live Response
                </h4>
                {testResult.status_code !== 0 && (
                  <span
                    className={`text-sm font-semibold ${getStatusColor(
                      testResult.status_code
                    )}`}
                  >
                    {testResult.status_code}
                  </span>
                )}
              </div>
              {testResult.response_body && !testResult.error && (
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
                {testResult.error.includes("Cannot connect") && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <strong>Troubleshooting tips:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Ensure the target server is running</li>
                      <li>
                        Check if the URL is correct and includes http:// or
                        https://
                      </li>
                      <li>
                        Verify the port number if different from standard ports
                      </li>
                      <li>Check for firewall or network restrictions</li>
                    </ul>
                  </div>
                )}
                {testResult.error.includes("timeout") && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <strong>Timeout occurred:</strong> The server took too long
                    to respond. This might indicate a slow endpoint or network
                    issues.
                  </div>
                )}
              </div>
            ) : (
              <>
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

                {showResponse && (
                  <div className="space-y-4">
                    {testResult.response_time && (
                      <div className="text-sm text-gray-600">
                        <strong>Response Time:</strong>{" "}
                        {testResult.response_time}ms
                      </div>
                    )}

                    {testResult.response_headers && (
                      <div>
                        <strong className="text-sm text-gray-700 block mb-2">
                          Response Headers:
                        </strong>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <pre className="text-gray-800">
                            {JSON.stringify(
                              testResult.response_headers,
                              null,
                              2
                            )}
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
    </div>
  );
};

export default EditableEndpointCard;
