// === src/components/DocumentationActions.jsx ===
import React from "react";
import { Download, Eye } from "lucide-react";

const DocumentationActions = ({ generatedDoc }) => {
  const handleViewDoc = () => {
    if (!generatedDoc || !generatedDoc.content) return;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>OpenAPI Documentation</title>
            <style>
              body { 
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                padding: 20px; 
                background: #1e1e1e; 
                color: #d4d4d4; 
                margin: 0; 
                line-height: 1.5;
              }
              pre { 
                white-space: pre-wrap; 
                word-wrap: break-word; 
                margin: 0; 
                font-size: 14px;
              }
              .header {
                background: #2d2d30;
                padding: 10px 20px;
                margin: -20px -20px 20px -20px;
                border-bottom: 1px solid #3e3e42;
              }
              .header h1 {
                margin: 0;
                color: #fff;
                font-size: 18px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>OpenAPI Documentation (${generatedDoc.format.toUpperCase()})</h1>
            </div>
            <pre>${generatedDoc.content}</pre>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleDownload = () => {
    if (!generatedDoc || !generatedDoc.content) return;

    const blob = new Blob([generatedDoc.content], {
      type:
        generatedDoc.format === "yaml"
          ? "application/x-yaml"
          : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openapi.${generatedDoc.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!generatedDoc || !generatedDoc.content) return null;

  // Safe string handling - ensure content is a string
  const contentString =
    typeof generatedDoc.content === "string"
      ? generatedDoc.content
      : JSON.stringify(generatedDoc.content, null, 2);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Generated Documentation
      </h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleViewDoc}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Eye className="mr-2 w-5 h-5" />
          View Documentation
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Download className="mr-2 w-5 h-5" />
          Download {generatedDoc.format.toUpperCase()}
        </button>
      </div>

      {/* Preview of the content */}
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96">
        <pre className="text-sm">
          <code>
            {contentString.substring(0, 1000)}
            {contentString.length > 1000 ? "..." : ""}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default DocumentationActions;
