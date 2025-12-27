import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../shared/hooks/useAuth";
import ProtectedRoute from "../auth/ProtectedRoute";
import {
  useProjects,
  useProjectAnalytics,
  useProjectTemplates,
  useProjectSearch,
  useEnhancedProjectManagement,
  useRealTimeProjects,
} from "../../shared/hooks/useProjectManagement";
import {
  ProjectDto,
  ProjectStatus,
  ConnectionType,
} from "../../shared/types/project";

interface RealTimeProjectDashboardProps {
  className?: string;
}

const RealTimeProjectDashboard: React.FC<RealTimeProjectDashboardProps> = ({
  className = "",
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "projects" | "analytics" | "templates" | "search"
  >("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(true);

  // Enhanced project management with real-time capabilities
  const {
    selectedProjects,
    selectProject,
    selectAllProjects,
    clearSelection,
    notifications,
    clearNotifications,
    connected,
    bulkUpdateStatus,
    bulkAssignManager,
    bulkDelete,
    bulkLoading,
  } = useEnhancedProjectManagement();

  // Projects data
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    pagination,
    refetch: refetchProjects,
  } = useProjects({
    pageSize: 20,
    search: searchQuery,
    status: filterStatus,
  });

  // Analytics data
  const { analytics, loading: analyticsLoading } = useProjectAnalytics({
    timeframe: "90d",
    includeFinancial: true,
    includePerformance: true,
  });

  // Templates data
  const { templates, loading: templatesLoading } = useProjectTemplates();

  // Real-time updates for all projects (demo)
  const { updates: allUpdates } = useRealTimeProjects(undefined, true); // Explicitly enable for dashboard

  // Handle bulk operations
  const handleBulkStatusUpdate = useCallback(
    async (status: string) => {
      const result = await bulkUpdateStatus(
        status,
        `Bulk status update to ${status}`
      );
      if (result) {
        refetchProjects();
        clearSelection();
      }
    },
    [bulkUpdateStatus, refetchProjects, clearSelection]
  );

  const handleSelectAll = useCallback(() => {
    const allProjectIds = projects.map((p) => p.projectId);
    selectAllProjects(allProjectIds);
  }, [projects, selectAllProjects]);

  // Auto-refresh projects when real-time updates come in
  useEffect(() => {
    if (allUpdates.length > 0) {
      refetchProjects();
    }
  }, [allUpdates, refetchProjects]);

  return (
    <ProtectedRoute>
      <div
        className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${className}`}
      >
        {/* Header with Real-time Status */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Real-Time Project Management
            </h1>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    connected ? "bg-blue-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              {notifications.length > 0 && (
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {notifications.length} new updates
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notifications Panel Toggle */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showNotifications ? "Hide" : "Show"} Notifications
          </button>
        </div>

        {/* Notifications Panel */}
        {showNotifications && notifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-blue-900">
                Real-Time Updates
              </h3>
              <button
                onClick={clearNotifications}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(-5).map((notification, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.projectName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.type
                          .replace("PROJECT_", "")
                          .toLowerCase()}
                        {" by "} {notification.updatedBy.fullName}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "projects", label: "Projects", count: projects.length },
              { id: "analytics", label: "Analytics" },
              { id: "templates", label: "Templates", count: templates?.length },
              { id: "search", label: "Advanced Search" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "projects" && (
          <ProjectsTab
            projects={projects}
            loading={projectsLoading}
            error={projectsError}
            pagination={pagination}
            selectedProjects={selectedProjects}
            onSelectProject={selectProject}
            onSelectAll={handleSelectAll}
            onClearSelection={clearSelection}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            bulkLoading={bulkLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab analytics={analytics} loading={analyticsLoading} />
        )}

        {activeTab === "templates" && (
          <TemplatesTab templates={templates} loading={templatesLoading} />
        )}

        {activeTab === "search" && <SearchTab />}
      </div>
    </ProtectedRoute>
  );
};

// Projects Tab Component
interface ProjectsTabProps {
  projects: ProjectDto[];
  loading: boolean;
  error: string | null;
  pagination: any;
  selectedProjects: string[];
  onSelectProject: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: string) => void;
  bulkLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  loading,
  error,
  pagination,
  selectedProjects,
  onSelectProject,
  onSelectAll,
  onClearSelection,
  onBulkStatusUpdate,
  bulkLoading,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(ProjectStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProjects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedProjects.length} project
              {selectedProjects.length > 1 ? "s" : ""} selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => onBulkStatusUpdate(ProjectStatus.IN_PROGRESS)}
                disabled={bulkLoading}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Start Projects
              </button>
              <button
                onClick={() => onBulkStatusUpdate(ProjectStatus.ON_HOLD)}
                disabled={bulkLoading}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
              >
                Put on Hold
              </button>
              <button
                onClick={onClearSelection}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Projects ({pagination?.totalCount || 0})
            </h3>
            <button
              onClick={onSelectAll}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Select All
            </button>
          </div>
        </div>

        <ul className="divide-y divide-gray-200">
          {projects.map((project) => (
            <li key={project.projectId} className="hover:bg-gray-50">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.projectId)}
                    onChange={() => onSelectProject(project.projectId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {project.projectName}
                    </h4>
                    <p className="text-sm text-gray-500">{project.address}</p>
                    <div className="flex items-center mt-1 space-x-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === ProjectStatus.COMPLETED
                            ? "bg-blue-100 text-blue-800"
                            : project.status === ProjectStatus.IN_PROGRESS
                            ? "bg-blue-100 text-blue-800"
                            : project.status === ProjectStatus.ON_HOLD
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status}
                      </span>
                      {project.totalCapacityKw && (
                        <span className="text-sm text-gray-500">
                          {project.totalCapacityKw.toLocaleString()} kW
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {project.completedTaskCount}/{project.taskCount} tasks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {project.projectManager?.fullName || "Unassigned"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Started: {new Date(project.startDate).toLocaleDateString()}
                  </p>
                  {project.updatedAt && (
                    <p className="text-xs text-gray-400">
                      Updated:{" "}
                      {new Date(project.updatedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {projects.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              disabled={!pagination.hasPreviousPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page {pagination.pageNumber} of {pagination.totalPages}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component
interface AnalyticsTabProps {
  analytics: any;
  loading: boolean;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Projects
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.summary?.totalProjects || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Projects
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.summary?.activeProjects || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">C</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Capacity
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.summary?.totalCapacity?.toLocaleString() || 0} kW
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">%</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    On-Time Delivery
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.summary?.onTimeDeliveryRate?.toFixed(1) || 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {analytics.statusBreakdown && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Project Status Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {Object.entries(analytics.statusBreakdown).map(
                ([status, count]) => (
                  <div key={status} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {count as number}
                    </div>
                    <div className="text-sm text-gray-500">{status}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {analytics.performanceMetrics && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Quality Score
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.performanceMetrics.qualityScore?.toFixed(1) || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Customer Satisfaction
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.performanceMetrics.customerSatisfaction?.toFixed(
                    1
                  ) || 0}
                  %
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Team Efficiency
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.performanceMetrics.teamEfficiency?.toFixed(1) || 0}
                  %
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Budget Variance
                </div>
                <div
                  className={`text-2xl font-bold ${
                    (analytics.performanceMetrics.budgetVariance || 0) < 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {analytics.performanceMetrics.budgetVariance?.toFixed(1) || 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Templates Tab Component
interface TemplatesTabProps {
  templates: any;
  loading: boolean;
}

const TemplatesTab: React.FC<TemplatesTabProps> = ({ templates, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.templates?.map((template: any) => (
          <div
            key={template.templateId}
            className="bg-white shadow rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{template.category}</span>
              <span>{template.estimatedDuration} days</span>
            </div>
            <div className="mt-4">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Use Template
              </button>
            </div>
          </div>
        )) || (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No templates available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Search Tab Component
const SearchTab: React.FC = () => {
  const {
    search: searchProjects,
    loading: searchLoading,
    results: searchResults,
  } = useProjectSearch();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    await searchProjects({
      q: searchQuery,
      facets: true,
    });
  }, [searchQuery, searchProjects]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Advanced search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {searchResults && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Found {searchResults.totalResults} results in{" "}
            {searchResults.searchTime}s
          </div>

          {searchResults.results?.map((result: any) => (
            <div
              key={result.projectId}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <h3 className="font-medium text-gray-900">
                {result.projectName}
              </h3>
              <div className="text-sm text-gray-600 mt-1">
                Relevance: {result.relevanceScore}%
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Matched: {result.matchedFields.join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealTimeProjectDashboard;
