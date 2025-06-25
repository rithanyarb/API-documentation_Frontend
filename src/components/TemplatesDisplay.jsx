// === src/components/TemplatesDisplay.jsx ===
import React, { useState } from "react";
import EditableEndpointCard from "./EditableEndpointCard";
import { testEndpoint } from "../api";

const TemplatesDisplay = ({ templates }) => {
  const [testResults, setTestResults] = useState({});
  const [testingEndpoint, setTestingEndpoint] = useState(null);
  const [editedTemplates, setEditedTemplates] = useState({});

  const handleTestEndpoint = async (template) => {
    const endpointId = template.endpoint_id || template.id;
    setTestingEndpoint(endpointId);

    try {
      const templateToTest = editedTemplates[endpointId] || template;

      let parsedBody = templateToTest.body;
      if (typeof parsedBody === "string" && parsedBody.trim()) {
        try {
          parsedBody = JSON.parse(parsedBody);
        } catch (error) {
          console.warn("Body parsing failed, sending as string:", error);
        }
      }

      const testData = {
        method: templateToTest.method,
        url: templateToTest.url,
        headers: templateToTest.headers || {},
        body: parsedBody || null,
      };

      console.log("Testing endpoint with data:", testData);

      const result = await testEndpoint(testData);
      setTestResults((prev) => ({
        ...prev,
        [endpointId]: result,
      }));
    } catch (error) {
      console.error("Test endpoint error:", error);
      setTestResults((prev) => ({
        ...prev,
        [endpointId]: {
          error: error.message,
          status_code: 0,
        },
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  const handleTemplateEdit = (endpointId, editedTemplate) => {
    setEditedTemplates((prev) => ({
      ...prev,
      [endpointId]: editedTemplate,
    }));
  };

  if (!templates || templates.length === 0) return null;

  console.log("Templates received in TemplatesDisplay:", templates);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        API Explorer ({templates.length} endpoints)
      </h3>
      <div className="space-y-6">
        {templates.map((template, index) => {
          const endpointId = template.endpoint_id || template.id;
          const displayTemplate = editedTemplates[endpointId] || template;

          console.log(
            `Template ${endpointId} parameters:`,
            template.parameters
          );

          return (
            <EditableEndpointCard
              key={endpointId || index}
              data={displayTemplate}
              originalData={template}
              onEdit={(editedTemplate) =>
                handleTemplateEdit(endpointId, editedTemplate)
              }
              onTest={(templateWithParams) =>
                handleTestEndpoint(templateWithParams)
              }
              isLoading={testingEndpoint === endpointId}
              testResult={testResults[endpointId]}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesDisplay;
