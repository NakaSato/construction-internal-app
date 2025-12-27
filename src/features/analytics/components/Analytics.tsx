import React, { useState } from "react";
import { DailyReportAnalyticsDto } from "../../../shared/types/reports";
import AnalyticsChartLoader from "./AnalyticsChartLoader";

interface AnalyticsProps {
  analytics: DailyReportAnalyticsDto;
  projectId: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ analytics, projectId }) => {
  const [activeTab, setActiveTab] = useState<"charts" | "summary">("summary");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Daily Reports Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights and performance metrics for project{" "}
            {analytics.projectName || projectId}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Analysis period:{" "}
            {new Date(analytics.analysisPeriodStart).toLocaleDateString()} -{" "}
            {new Date(analytics.analysisPeriodEnd).toLocaleDateString()}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("summary")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "summary"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📋 Summary
              </button>
              <button
                onClick={() => setActiveTab("charts")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "charts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📈 Charts
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "summary" ? (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      📊
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Reports
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalReports}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      ⏱️
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Hours Logged
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalHoursLogged}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      🎯
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Avg Safety Score
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.averageSafetyScore?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      ⚡
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Productivity
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.productivityIndex?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📈 Progress Metrics
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Average Hours/Day</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {analytics.averageHoursPerDay?.toFixed(1) || "N/A"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">
                      Progress Contribution
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {analytics.totalProgressContribution?.toFixed(1) || "N/A"}
                      %
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">
                      Average Progress/Day
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {analytics.averageProgressPerDay?.toFixed(2) || "N/A"}%
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Schedule Variance</dt>
                    <dd
                      className={`text-sm font-medium ${
                        (analytics.daysAheadBehindSchedule || 0) >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.daysAheadBehindSchedule > 0 && "+"}
                      {analytics.daysAheadBehindSchedule || 0} days
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🌤️ Weather & Issues
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">
                      Weather Delay Days
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {analytics.weatherDelayDays || 0}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">
                      Weather Impact Score
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {analytics.weatherImpactScore?.toFixed(1) || "N/A"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Critical Issues</dt>
                    <dd className="text-sm font-medium text-red-600">
                      {analytics.totalCriticalIssues || 0}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Average Team Size</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {analytics.averageTeamSize?.toFixed(1) || "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Top Issues */}
            {analytics.topIssueCategories &&
              analytics.topIssueCategories.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ⚠️ Top Issue Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.topIssueCategories.map((issue, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <AnalyticsChartLoader analytics={analytics} />
        )}
      </div>
    </div>
  );
};

export default Analytics;
