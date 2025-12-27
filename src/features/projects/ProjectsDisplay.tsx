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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Grid follows 3x3 layout by default

  // Reset pagination when filters or sort change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

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

  // Pagination logic
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="px-8 py-8 border-b border-gray-100">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <div>
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Projects
              <span className="ml-3 text-lg font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {projects.length}
              </span>
            </h3>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Manage and monitor your solar installation sites
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              title="Refresh Projects"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {(isAdmin || isManager) && onCreateProject && (
              <button
                onClick={onCreateProject}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="text-xl leading-none">+</span>
                <span>New Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search projects by name, client, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border-none rounded-xl bg-white shadow-sm ring-1 ring-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white py-2.5 pl-4 pr-10 rounded-xl shadow-sm ring-1 ring-gray-200 text-sm font-medium text-gray-700 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white py-2.5 pl-4 pr-10 rounded-xl shadow-sm ring-1 ring-gray-200 text-sm font-medium text-gray-700 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                >
                  <option value="name">Sort: Name</option>
                  <option value="status">Sort: Status</option>
                  <option value="capacity">Sort: Capacity</option>
                  <option value="startDate">Sort: Date</option>
                  <option value="progress">Sort: Progress</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {/* View Toggle */}
            <div className="bg-white p-1 rounded-xl shadow-sm ring-1 ring-gray-200 flex items-center">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                  ? "bg-gray-100 text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                title="Grid View"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list"
                  ? "bg-gray-100 text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                title="List View"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-8">
        {sortedProjects.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-gray-100">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              {searchTerm || statusFilter !== "all"
                ? "We couldn't find any projects matching your search criteria. Try adjusting your filters."
                : "Get started by creating your first construction project to track progress."}
            </p>

            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="bg-white text-gray-900 border border-gray-300 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                Clear all filters
              </button>
            )}

            {!searchTerm && statusFilter === "all" && onCreateProject && (isAdmin || isManager) && (
              <button
                onClick={onCreateProject}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-all shadow-lg"
              >
                Create new project
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={`${viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
                }`}
            >
              {paginatedProjects.map((project) => (
                <div
                  key={project.projectId}
                  className={`${viewMode === "grid"
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
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() =>
                            navigate(`/projects/${project.projectId}`)
                          }
                          className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                        >
                          View Details
                        </button>
                        {(isAdmin || isManager) && (
                          <button className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200">
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

            {/* Pagination Controls */}
            {sortedProjects.length > itemsPerPage && (
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, sortedProjects.length)}
                  </span>{" "}
                  of <span className="font-medium">{sortedProjects.length}</span> projects
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Details Modal */}
      {
        selectedProject && (
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
        )
      }
    </div >
  );
};

export default ProjectsDisplay;
