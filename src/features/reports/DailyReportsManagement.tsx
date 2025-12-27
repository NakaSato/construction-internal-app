import React, { useState, useEffect, useMemo } from "react";
import {
  useDailyReports,
  useDailyReportAnalytics,
  useDailyReportBulkOperations,
  useRole,
} from "../../shared/hooks";
import {
  DailyReportDto,
  CreateDailyReportRequest,
  DailyReportApprovalStatus,
  GetDailyReportsParams,
} from "../../shared/types/project";
import { EnhancedAnalyticsLoader } from "../../components";
import PredictiveAnalytics from "./components/PredictiveAnalytics";
import InteractiveCharts from "./components/InteractiveCharts";

interface DailyReportsManagementProps {
  projectId?: string;
  userId?: string;
  showAnalytics?: boolean;
}

const DailyReportsManagement: React.FC<DailyReportsManagementProps> = ({
  projectId,
  userId,
  showAnalytics = true,
}) => {
  const { isAdmin, isManager } = useRole();
  const [selectedTab, setSelectedTab] = useState<
    "reports" | "analytics" | "predictive" | "charts" | "templates"
  >("reports");
  const [filters, setFilters] = useState<GetDailyReportsParams>({
    projectId,
    userId,
    pageNumber: 1,
    pageSize: 10,
  });
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Hooks
  const {
    reports,
    loading,
    error,
    pagination,
    realTimeUpdates,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    approveReport,
    rejectReport,
    submitForApproval,
    clearError,
    clearUpdates,
  } = useDailyReports(projectId);

  const { analytics, fetchAnalytics } = useDailyReportAnalytics(
    projectId || ""
  );

  const { bulkApprove, bulkReject, exportReports } =
    useDailyReportBulkOperations();

  // Fetch reports when filters change
  useEffect(() => {
    fetchReports(filters);
  }, [filters, fetchReports]);

  // Fetch analytics when tab changes
  useEffect(() => {
    if (selectedTab === "analytics" && projectId) {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      fetchAnalytics(startDate, endDate);
    }
  }, [selectedTab, projectId, fetchAnalytics]);

  // Memoized filtered reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report) => {
      if (
        filters.approvalStatus &&
        report.approvalStatus !== filters.approvalStatus
      ) {
        return false;
      }
      if (
        filters.hasCriticalIssues !== undefined &&
        report.hasCriticalIssues !== filters.hasCriticalIssues
      ) {
        return false;
      }
      return true;
    });
  }, [reports, filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof GetDailyReportsParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  // Handle report selection
  const handleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((report) => report.id));
    }
  };

  // Handle bulk operations
  const handleBulkApprove = async () => {
    if (selectedReports.length === 0) return;

    const result = await bulkApprove({
      reportIds: selectedReports,
      comments: "Bulk approval",
    });

    if (result) {
      setSelectedReports([]);
      fetchReports(filters);
    }
  };

  const handleBulkReject = async () => {
    if (selectedReports.length === 0) return;

    const reason = prompt("Please provide a rejection reason:");
    if (!reason) return;

    const result = await bulkReject({
      reportIds: selectedReports,
      rejectionReason: reason,
    });

    if (result) {
      setSelectedReports([]);
      fetchReports(filters);
    }
  };

  const handleExport = async () => {
    const result = await exportReports({
      projectId,
      startDate:
        filters.startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      endDate: filters.endDate || new Date().toISOString().split("T")[0],
      format: "excel",
      includeAttachments: true,
      includeAnalytics: true,
    });

    if (result) {
      // Create download link
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading && !reports.length) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
            <p className="text-gray-600">Manage and track daily work reports</p>
          </div>
          <div className="flex space-x-3">
            {(isAdmin || isManager) && (
              <>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Export Reports
                </button>
                {selectedReports.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleBulkApprove}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Approve Selected ({selectedReports.length})
                    </button>
                    <button
                      onClick={handleBulkReject}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject Selected
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Report
            </button>
          </div>
        </div>

        {/* Real-time updates notification */}
        {realTimeUpdates.length > 0 && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-blue-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {realTimeUpdates.length} new update(s) received
                  <button
                    onClick={clearUpdates}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === "reports"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📋 Reports
          </button>
          {showAnalytics && (
            <button
              onClick={() => setSelectedTab("analytics")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === "analytics"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📊 Analytics
            </button>
          )}
          {showAnalytics && analytics && (
            <button
              onClick={() => setSelectedTab("predictive")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === "predictive"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🔮 Predictive AI
            </button>
          )}
          {showAnalytics && analytics && (
            <button
              onClick={() => setSelectedTab("charts")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === "charts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📊 Interactive Charts
            </button>
          )}
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {selectedTab === "reports" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Status
                </label>
                <select
                  value={filters.approvalStatus || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "approvalStatus",
                      e.target.value || undefined
                    )
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value={DailyReportApprovalStatus.DRAFT}>Draft</option>
                  <option value={DailyReportApprovalStatus.SUBMITTED}>
                    Submitted
                  </option>
                  <option value={DailyReportApprovalStatus.APPROVED}>
                    Approved
                  </option>
                  <option value={DailyReportApprovalStatus.REJECTED}>
                    Rejected
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value || undefined)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value || undefined)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Daily Reports ({pagination?.totalCount || 0})
                </h3>
                {(isAdmin || isManager) && reports.length > 0 && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedReports.length === filteredReports.length &&
                        filteredReports.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Select All
                    </span>
                  </label>
                )}
              </div>

              {filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No daily reports found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(isAdmin || isManager) && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reporter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Safety
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quality
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          {(isAdmin || isManager) && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedReports.includes(report.id)}
                                onChange={() => handleSelectReport(report.id)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(report.reportDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                report.approvalStatus ===
                                DailyReportApprovalStatus.APPROVED
                                  ? "bg-blue-100 text-blue-800"
                                  : report.approvalStatus ===
                                    DailyReportApprovalStatus.REJECTED
                                  ? "bg-red-100 text-red-800"
                                  : report.approvalStatus ===
                                    DailyReportApprovalStatus.SUBMITTED
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.approvalStatus
                                .replace(/([A-Z])/g, " $1")
                                .trim()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.hoursWorked}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900">
                                {report.safetyScore}/10
                              </span>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (report.safetyScore / 10) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900">
                                {report.qualityScore}/10
                              </span>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (report.qualityScore / 10) * 100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  /* TODO: View report */
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                              {(isAdmin ||
                                isManager ||
                                report.userId === userId) &&
                                report.approvalStatus ===
                                  DailyReportApprovalStatus.DRAFT && (
                                  <button
                                    onClick={() => {
                                      /* TODO: Edit report */
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Edit
                                  </button>
                                )}
                              {(isAdmin || isManager) &&
                                report.approvalStatus ===
                                  DailyReportApprovalStatus.SUBMITTED && (
                                  <>
                                    <button
                                      onClick={() => approveReport(report.id)}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reason =
                                          prompt("Rejection reason:");
                                        if (reason)
                                          rejectReport(report.id, reason);
                                      }}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex justify-between sm:hidden">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.pageNumber - 1)
                        }
                        disabled={!pagination.hasPreviousPage}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(pagination.pageNumber + 1)
                        }
                        disabled={!pagination.hasNextPage}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(pagination.pageNumber - 1) * pagination.pageSize +
                              1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              pagination.pageNumber * pagination.pageSize,
                              pagination.totalCount
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {pagination.totalCount}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() =>
                              handlePageChange(pagination.pageNumber - 1)
                            }
                            disabled={!pagination.hasPreviousPage}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          {Array.from(
                            { length: Math.min(5, pagination.totalPages) },
                            (_, i) => {
                              const page = i + 1;
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === pagination.pageNumber
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            }
                          )}
                          <button
                            onClick={() =>
                              handlePageChange(pagination.pageNumber + 1)
                            }
                            disabled={!pagination.hasNextPage}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === "analytics" && analytics && (
        <EnhancedAnalyticsLoader
          analytics={analytics}
          projectId={projectId || ""}
        />
      )}

      {/* Predictive Analytics Tab */}
      {selectedTab === "predictive" && analytics && (
        <PredictiveAnalytics
          analytics={analytics}
          projectId={projectId || ""}
          onInsightAction={(action, data) => {
            console.log("Insight action:", action, data);
            // TODO: Implement insight actions like applying resource recommendations
          }}
        />
      )}

      {/* Interactive Charts Tab */}
      {selectedTab === "charts" && analytics && (
        <InteractiveCharts analytics={analytics} projectId={projectId || ""} />
      )}
    </div>
  );
};

export default DailyReportsManagement;
