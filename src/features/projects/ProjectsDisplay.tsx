import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectDto } from "../../shared/types/project";
import { useAuth, useRole } from "../../shared/hooks/useAuth";

interface ProjectsDisplayProps {
  projects: ProjectDto[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreateProject?: () => void;
}

const ProjectsDisplay: React.FC<ProjectsDisplayProps> = ({
  projects,
  loading,
  error,
  onRefresh,
  onCreateProject,
}) => {
  const { isAdmin, isManager } = useRole();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<ProjectDto | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.projectName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (project.address?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (project.clientInfo?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.projectName || "").localeCompare(b.projectName || "");
      case "status":
        return (a.status || "").localeCompare(b.status || "");
      case "capacity":
        return (b.totalCapacityKw || 0) - (a.totalCapacityKw || 0);
      case "startDate":
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      case "progress":
        return calculateProgress(b) - calculateProgress(a);
      default:
        return 0;
    }
  });

  // Get status color with improved styling
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "InProgress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OnHold":
        return "bg-red-100 text-red-800 border-red-200";
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "Planning":
        return "📋";
      case "InProgress":
        return "⚡";
      case "Completed":
        return "✅";
      case "OnHold":
        return "⏸️";
      case "Cancelled":
        return "❌";
      default:
        return "❓";
    }
  };

  // Get priority based on status and progress
  const getPriority = (project: ProjectDto) => {
    const progress = calculateProgress(project);
    if (project.status === "OnHold") return "High";
    if (project.status === "InProgress" && progress < 30) return "Medium";
    if (project.status === "Planning") return "Low";
    return "Normal";
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Calculate progress percentage
  const calculateProgress = (project: ProjectDto) => {
    if (project.taskCount === 0) return 0;
    return Math.round((project.completedTaskCount / project.taskCount) * 100);
  };

  // Format date with relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days until end date
  const getDaysUntilEnd = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffInDays = Math.floor(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffInDays;
  };

  // Get completion status message
  const getCompletionMessage = (project: ProjectDto) => {
    const progress = calculateProgress(project);
    const daysUntilEnd = getDaysUntilEnd(project.estimatedEndDate);

    if (progress === 100) return "✅ Completed";
    if (daysUntilEnd !== null) {
      if (daysUntilEnd < 0) return "⚠️ Overdue";
      if (daysUntilEnd < 7) return `⏰ Due in ${daysUntilEnd} days`;
      if (daysUntilEnd < 30) return `📅 Due in ${daysUntilEnd} days`;
    }
    return `🚧 ${progress}% complete`;
  };

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(
    new Set(
      projects
        .map((p) => p.status)
        .filter((status): status is string => status !== null)
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-400 mr-3">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Error loading projects
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={onRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">
              All Projects ({projects.length})
            </h3>
            <p className="text-gray-600 mt-1">
              {filteredProjects.length !== projects.length &&
                `Showing ${filteredProjects.length} of ${projects.length} projects`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🔲 Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 List
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔍 {showFilters ? "Hide" : "Show"} Filters
            </button>

            <button
              onClick={onRefresh}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🔄 Refresh
            </button>
            {(isAdmin || isManager) && onCreateProject && (
              <button
                onClick={onCreateProject}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                + New Project
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div
          className={`transition-all duration-300 ${
            showFilters
              ? "opacity-100 max-h-96"
              : "opacity-0 max-h-0 overflow-hidden"
          }`}
        >
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Projects
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, address, or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    🔍
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses ({projects.length})</option>
                  {uniqueStatuses.map((status) => {
                    const count = projects.filter(
                      (p) => p.status === status
                    ).length;
                    return (
                      <option key={status} value={status}>
                        {getStatusIcon(status)} {status} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">📝 Project Name</option>
                  <option value="status">🏷️ Status</option>
                  <option value="capacity">⚡ Capacity</option>
                  <option value="startDate">📅 Start Date</option>
                  <option value="progress">📊 Progress</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-8">
        {sortedProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by creating your first project"}
            </p>
          </div>
        ) : (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }`}
          >
            {sortedProjects.map((project) => (
              <div
                key={project.projectId}
                className={`${
                  viewMode === "grid"
                    ? "bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    : "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 flex items-center space-x-4"
                }`}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    {/* Project Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <button
                          onClick={() =>
                            navigate(`/projects/${project.projectId}`)
                          }
                          className="text-left hover:text-blue-600 transition-colors mb-2"
                        >
                          <h4 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                            {project.projectName || "Unnamed Project"}
                          </h4>
                        </button>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {getStatusIcon(project.status)}{" "}
                            {project.status || "Unknown"}
                          </span>
                          <span
                            className={`text-xs font-medium ${getPriorityColor(
                              getPriority(project)
                            )}`}
                          >
                            {getPriority(project)} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-3">
                      {/* Address */}
                      {project.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-4 h-4 mr-2">📍</span>
                          <span className="truncate">{project.address}</span>
                        </div>
                      )}

                      {/* Client Info */}
                      {project.clientInfo && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-4 h-4 mr-2">👤</span>
                          <span className="truncate">{project.clientInfo}</span>
                        </div>
                      )}

                      {/* Capacity */}
                      {project.totalCapacityKw && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-4 h-4 mr-2">⚡</span>
                          <span className="font-medium">
                            {project.totalCapacityKw.toLocaleString()} kW
                          </span>
                        </div>
                      )}

                      {/* Start Date */}
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-4 h-4 mr-2">📅</span>
                        Started: {formatDate(project.startDate)}
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {calculateProgress(project)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${calculateProgress(project)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {project.completedTaskCount} of {project.taskCount}{" "}
                          tasks completed
                        </div>
                        <div className="text-xs font-medium text-gray-600 mt-1">
                          {getCompletionMessage(project)}
                        </div>
                      </div>

                      {/* Project Manager */}
                      {project.projectManager && (
                        <div className="flex items-center text-sm text-gray-600 mt-4">
                          <span className="w-4 h-4 mr-2">👨‍💼</span>
                          <span className="truncate">
                            {project.projectManager.fullName ||
                              project.projectManager.username}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/projects/${project.projectId}`)
                        }
                        className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                      >
                        👁️ View Details
                      </button>
                      {(isAdmin || isManager) && (
                        <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200">
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <button
                          onClick={() =>
                            navigate(`/projects/${project.projectId}`)
                          }
                          className="text-left hover:text-blue-600 transition-colors"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                            {project.projectName || "Unnamed Project"}
                          </h4>
                        </button>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {getStatusIcon(project.status)}{" "}
                          {project.status || "Unknown"}
                        </span>
                        <span
                          className={`text-xs font-medium ${getPriorityColor(
                            getPriority(project)
                          )}`}
                        >
                          {getPriority(project)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {project.address && (
                          <span className="flex items-center">
                            <span className="mr-1">📍</span>
                            {project.address.length > 30
                              ? `${project.address.substring(0, 30)}...`
                              : project.address}
                          </span>
                        )}
                        {project.clientInfo && (
                          <span className="flex items-center">
                            <span className="mr-1">👤</span>
                            {project.clientInfo}
                          </span>
                        )}
                        {project.totalCapacityKw && (
                          <span className="flex items-center">
                            <span className="mr-1">⚡</span>
                            {project.totalCapacityKw.toLocaleString()} kW
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="w-32">
                      <div className="text-xs text-gray-500 mb-1">Progress</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(project)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {calculateProgress(project)}%
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/projects/${project.projectId}`)
                        }
                        className="bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        👁️ View
                      </button>
                      {(isAdmin || isManager) && (
                        <button className="bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProject.projectName || "Unnamed Project"}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedProject.status
                      )}`}
                    >
                      {getStatusIcon(selectedProject.status)}{" "}
                      {selectedProject.status || "Unknown"}
                    </span>
                    <span
                      className={`text-sm font-medium ${getPriorityColor(
                        getPriority(selectedProject)
                      )}`}
                    >
                      {getPriority(selectedProject)} Priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Project Information
                  </h4>

                  {selectedProject.address && (
                    <div className="flex items-start space-x-3">
                      <span className="text-gray-400 mt-1">📍</span>
                      <div>
                        <div className="font-medium text-gray-900">Address</div>
                        <div className="text-gray-600">
                          {selectedProject.address}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProject.clientInfo && (
                    <div className="flex items-start space-x-3">
                      <span className="text-gray-400 mt-1">👤</span>
                      <div>
                        <div className="font-medium text-gray-900">Client</div>
                        <div className="text-gray-600">
                          {selectedProject.clientInfo}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProject.totalCapacityKw && (
                    <div className="flex items-start space-x-3">
                      <span className="text-gray-400 mt-1">⚡</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          Total Capacity
                        </div>
                        <div className="text-gray-600">
                          {selectedProject.totalCapacityKw.toLocaleString()} kW
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <span className="text-gray-400 mt-1">📅</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        Start Date
                      </div>
                      <div className="text-gray-600">
                        {formatDate(selectedProject.startDate)}
                      </div>
                    </div>
                  </div>

                  {selectedProject.estimatedEndDate && (
                    <div className="flex items-start space-x-3">
                      <span className="text-gray-400 mt-1">🎯</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          Estimated End Date
                        </div>
                        <div className="text-gray-600">
                          {formatDate(selectedProject.estimatedEndDate)}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProject.projectManager && (
                    <div className="flex items-start space-x-3">
                      <span className="text-gray-400 mt-1">👨‍💼</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          Project Manager
                        </div>
                        <div className="text-gray-600">
                          {selectedProject.projectManager.fullName ||
                            selectedProject.projectManager.username}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress and Statistics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Progress & Statistics
                  </h4>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900">
                        Overall Progress
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {calculateProgress(selectedProject)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${calculateProgress(selectedProject)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {selectedProject.completedTaskCount} of{" "}
                      {selectedProject.taskCount} tasks completed
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-700">
                      {getCompletionMessage(selectedProject)}
                    </div>
                  </div>

                  {/* Equipment Details */}
                  {selectedProject.equipmentDetails && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">
                        Equipment Details
                      </h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedProject.equipmentDetails.inverter125kw > 0 && (
                          <div>
                            <div className="text-gray-600">125kW Inverters</div>
                            <div className="font-medium">
                              {selectedProject.equipmentDetails.inverter125kw}
                            </div>
                          </div>
                        )}
                        {selectedProject.equipmentDetails.inverter80kw > 0 && (
                          <div>
                            <div className="text-gray-600">80kW Inverters</div>
                            <div className="font-medium">
                              {selectedProject.equipmentDetails.inverter80kw}
                            </div>
                          </div>
                        )}
                        {selectedProject.equipmentDetails.inverter60kw > 0 && (
                          <div>
                            <div className="text-gray-600">60kW Inverters</div>
                            <div className="font-medium">
                              {selectedProject.equipmentDetails.inverter60kw}
                            </div>
                          </div>
                        )}
                        {selectedProject.equipmentDetails.inverter40kw > 0 && (
                          <div>
                            <div className="text-gray-600">40kW Inverters</div>
                            <div className="font-medium">
                              {selectedProject.equipmentDetails.inverter40kw}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Financial Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">
                      Financial Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      {selectedProject.revenueValue && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue Value</span>
                          <span className="font-medium">
                            ${selectedProject.revenueValue.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedProject.ftsValue && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">FTS Value</span>
                          <span className="font-medium">
                            ${selectedProject.ftsValue.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedProject.pqmValue && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">PQM Value</span>
                          <span className="font-medium">
                            ${selectedProject.pqmValue.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {(isAdmin || isManager) && (
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDisplay;
