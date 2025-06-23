// === src/components/PieChart.jsx ===
import React from "react";

const PieChart = ({ data, title, subtitle }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#6B7280"];
  const features = ["openapijson", "curl", "backendzip", "githubrepo"];
  const labels = ["OpenAPI JSON", "cURL Command", "Backend ZIP", "GitHub Repo"];

  let cumulativePercentage = 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg
            viewBox="0 0 42 42"
            className="w-full h-full transform -rotate-90"
          >
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            {features.map((feature, index) => {
              const percentage = total > 0 ? (data[feature] / total) * 100 : 0;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;

              const element = (
                <circle
                  key={feature}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={colors[index]}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );

              cumulativePercentage += percentage;
              return element;
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={feature} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-sm font-medium text-gray-700">
                {labels[index]}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{data[feature]}</span>
              <span className="text-xs text-gray-500">
                ({total > 0 ? ((data[feature] / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
