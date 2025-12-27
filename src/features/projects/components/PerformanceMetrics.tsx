import React from "react";

interface PerformanceMetricsProps {
  performance: any;
}

const PerformanceMetrics = ({ performance }: PerformanceMetricsProps) => {
  if (!performance) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Performance Analytics
        </h2>
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              performance.riskAssessment.riskLevel === "Low"
                ? "bg-blue-100 text-blue-800"
                : performance.riskAssessment.riskLevel === "Medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Risk: {performance.riskAssessment.riskLevel}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {performance.overallScore}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Timeline</span>
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {performance.kpis.timelineAdherence}%
          </div>
          <div className="text-xs text-blue-600">Adherence</div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Budget</span>
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {performance.kpis.budgetEfficiency}%
          </div>
          <div className="text-xs text-blue-600">Efficiency</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Quality</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {performance.kpis.qualityScore}%
          </div>
          <div className="text-xs text-purple-600">Score</div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Safety</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {performance.kpis.safetyRecord}%
          </div>
          <div className="text-xs text-orange-600">Record</div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-pink-700">
              Stakeholder
            </span>
          </div>
          <div className="text-2xl font-bold text-pink-900">
            {performance.kpis.stakeholderSatisfaction}%
          </div>
          <div className="text-xs text-pink-600">Satisfaction</div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Risks</span>
          </div>
          <div className="text-2xl font-bold text-red-900">
            {performance.riskAssessment.activeRisks}
          </div>
          <div className="text-xs text-red-600">Active</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
