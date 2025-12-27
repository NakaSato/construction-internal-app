import React, { useState } from "react";
import { Project } from "../../shared/types/project";
import { ReportService } from "../../shared/utils";
import { projectsToProjectDtos } from "../../shared/utils/projectTypeAdapter";

interface ReportsTabProps {
  projects: Project[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({ projects }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  // Calculate stats for PDF generation
  const calculateStats = () => {
    return {
      totalProjects: projects.length,
      totalBudget,
      totalSpent,
      totalCapacity: projects.length, // Using project count as capacity measure
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      activeProjects: projects.filter(
        (p) =>
          p.status === "Construction" ||
          p.status === "Planning" ||
          p.status === "Design"
      ).length,
      statusDistribution: projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  };

  const handleGeneratePdf = async (
    reportType: "overview" | "detailed" | "financial"
  ) => {
    if (projects.length === 0) {
      alert("No projects available to generate a report.");
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const stats = calculateStats();

      if (dateRange.startDate && dateRange.endDate) {
        // Validate date range
        if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
          alert("Start date must be before end date.");
          return;
        }

        // Generate filtered report
        await ReportService.generateFilteredReport(
          projectsToProjectDtos(projects),
          stats,
          dateRange.startDate,
          dateRange.endDate,
          reportType
        );
      } else {
        // Generate full report
        await ReportService.generateAndDownloadReport(
          projectsToProjectDtos(projects),
          stats,
          {
            reportType,
            filename: `solar-projects-${reportType}-report-${
              new Date().toISOString().split("T")[0]
            }.pdf`,
          }
        );
      }

      // Show success message
      alert(
        `${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } report generated successfully!`
      );
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate PDF report. Please try again.";
      alert(errorMessage);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const statuses = [
    "Planning",
    "Design",
    "Permits",
    "Construction",
    "Inspection",
    "Completed",
  ] as const;

  return (
    <div className="space-y-8">
      {/* PDF Report Generation Section */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900">
            Generate PDF Reports
          </h3>
          <p className="text-gray-600 mt-2">
            Create comprehensive reports for your solar projects
          </p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Date Range Filter */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Date Range Filter (Optional)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              {dateRange.startDate && dateRange.endDate && (
                <p className="text-sm text-blue-600">
                  📅 Report will include projects from{" "}
                  {new Date(dateRange.startDate).toLocaleDateString()} to{" "}
                  {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Report Generation Buttons */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Report Types
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => handleGeneratePdf("overview")}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading PDF engine...
                    </>
                  ) : (
                    <>📊 Generate Overview Report</>
                  )}
                </button>

                <button
                  onClick={() => handleGeneratePdf("detailed")}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading PDF engine...
                    </>
                  ) : (
                    <>📋 Generate Detailed Report</>
                  )}
                </button>

                <button
                  onClick={() => handleGeneratePdf("financial")}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading PDF engine...
                    </>
                  ) : (
                    <>💰 Generate Financial Report</>
                  )}
                </button>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Report Types:</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>
                    • <strong>Overview:</strong> High-level summary and
                    statistics
                  </li>
                  <li>
                    • <strong>Detailed:</strong> Complete project listings with
                    details
                  </li>
                  <li>
                    • <strong>Financial:</strong> Budget analysis and financial
                    data
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900">
            Financial Summary
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-blue-600">
                ${(totalBudget / 1000000).toFixed(1)}M
              </div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Total Budget
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-blue-600">
                ${(totalSpent / 1000000).toFixed(1)}M
              </div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Total Spent
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-orange-600">
                {((totalSpent / totalBudget) * 100).toFixed(1)}%
              </div>
              <div className="text-lg text-gray-600 font-medium mt-2">
                Budget Utilization
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900">
            Project Status Distribution
          </h3>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statuses.map((status) => {
              const count = projects.filter((p) => p.status === status).length;
              return (
                <div
                  key={status}
                  className="text-center bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-gray-900">
                    {count}
                  </div>
                  <div className="text-base text-gray-600 font-medium mt-2">
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
