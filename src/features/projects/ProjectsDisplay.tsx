import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectDto } from "../../shared/types/project";
import { useRole } from "../../shared/hooks/useAuth";
import {
  MapPin,
  Zap,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  PlayCircle,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Plus,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

interface ProjectsDisplayProps {
  projects: ProjectDto[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreateProject?: () => void;
}

type ViewMode = "table" | "grid";
type SortKey = "name" | "status" | "capacity" | "revenue" | "startDate";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  Planning: { badge: "bg-sky-50 text-sky-700 ring-sky-600/20", dot: "bg-sky-500", label: "Planning" },
  InProgress: { badge: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500", label: "In Progress" },
  Completed: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500", label: "Completed" },
  OnHold: { badge: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400", label: "On Hold" },
  Cancelled: { badge: "bg-rose-50 text-rose-700 ring-rose-600/20", dot: "bg-rose-500", label: "Cancelled" },
};

const statusStyle = (status: string | null) =>
  STATUS_STYLES[status ?? ""] ?? {
    badge: "bg-gray-100 text-gray-600 ring-gray-500/20",
    dot: "bg-gray-400",
    label: status || "Unknown",
  };

const statusIcon = (status: string | null) => {
  const cls = "w-3.5 h-3.5";
  switch (status) {
    case "Planning":
      return <ClipboardList className={cls} />;
    case "InProgress":
      return <PlayCircle className={cls} />;
    case "Completed":
      return <CheckCircle2 className={cls} />;
    case "OnHold":
      return <Clock className={cls} />;
    case "Cancelled":
      return <XCircle className={cls} />;
    default:
      return <HelpCircle className={cls} />;
  }
};

/** Thai baht, abbreviated the same way the dashboard tiles do (฿124.0M). */
const formatBaht = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  if (Math.abs(value) >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `฿${Math.round(value / 1_000)}K`;
  return `฿${value.toLocaleString()}`;
};

const formatKw = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `${value.toLocaleString()} kW`;

const formatDay = (dateString: string | null | undefined, withYear = true) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
};

const calculateProgress = (project: ProjectDto) => {
  if (!project.taskCount) return 0;
  return Math.round((project.completedTaskCount / project.taskCount) * 100);
};

const ProjectsDisplay: React.FC<ProjectsDisplayProps> = ({
  projects,
  loading,
  error,
  onRefresh,
  onCreateProject,
}) => {
  const { isAdmin, isManager } = useRole();
  const navigate = useNavigate();
  const canManage = isAdmin || isManager;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortKey, setSortKey] = useState<SortKey>("capacity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = viewMode === "grid" ? 9 : 15;

  // Reset pagination when the result set or page size changes. currentPage is
  // also user-controlled, so it can't simply be derived during render.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

  const uniqueStatuses = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => p.status).filter((s): s is string => !!s))
      ),
    [projects]
  );

  const visibleProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      const matchesSearch =
        !term ||
        (project.projectName?.toLowerCase() || "").includes(term) ||
        (project.address?.toLowerCase() || "").includes(term) ||
        (project.clientInfo?.toLowerCase() || "").includes(term);

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const direction = sortDir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return direction * (a.projectName || "").localeCompare(b.projectName || "");
        case "status":
          return direction * (a.status || "").localeCompare(b.status || "");
        case "capacity":
          return direction * ((a.totalCapacityKw || 0) - (b.totalCapacityKw || 0));
        case "revenue":
          return direction * ((a.revenueValue || 0) - (b.revenueValue || 0));
        case "startDate":
          return (
            direction *
            (new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          );
        default:
          return 0;
      }
    });
  }, [projects, searchTerm, statusFilter, sortKey, sortDir]);

  // Totals reflect the current filter, so the footer always matches what's listed.
  const totals = useMemo(
    () =>
      visibleProjects.reduce(
        (acc, p) => ({
          capacity: acc.capacity + (p.totalCapacityKw || 0),
          revenue: acc.revenue + (p.revenueValue || 0),
        }),
        { capacity: 0, revenue: 0 }
      ),
    [visibleProjects]
  );

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / itemsPerPage));
  const pageProjects = visibleProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Text sorts read best A→Z; numbers read best largest-first.
      setSortDir(key === "name" || key === "status" ? "asc" : "desc");
    }
  };

  const SortHeader: React.FC<{
    label: string;
    sortAs: SortKey;
    className?: string;
  }> = ({ label, sortAs, className = "" }) => (
    <th scope="col" className={`px-4 py-3 ${className}`}>
      <button
        onClick={() => toggleSort(sortAs)}
        className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors"
      >
        {label}
        {sortKey === sortAs ? (
          sortDir === "asc" ? (
            <ArrowUp className="w-3 h-3 text-gray-900" />
          ) : (
            <ArrowDown className="w-3 h-3 text-gray-900" />
          )
        ) : (
          <ArrowUp className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </button>
    </th>
  );

  const StatusBadge: React.FC<{ status: string | null }> = ({ status }) => {
    const s = statusStyle(status);
    return (
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.badge}`}
      >
        {statusIcon(status)}
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
        <span className="ml-3 text-gray-600">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-rose-800">
          Error loading projects
        </h3>
        <p className="text-sm text-rose-700 mt-1">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-4 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-200">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              Projects
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {projects.length}
              </span>
            </h3>
            <p className="text-gray-500 mt-1 text-sm">
              Manage and monitor your solar installation sites
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              title="Refresh projects"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            {canManage && onCreateProject && (
              <button
                onClick={onCreateProject}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-5 flex flex-col lg:flex-row gap-3 justify-between lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, client, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 rounded-xl bg-white ring-1 ring-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white py-2.5 pl-3 pr-8 rounded-xl ring-1 ring-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
            >
              <option value="all">All statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusStyle(status).label}
                </option>
              ))}
            </select>

            <div className="bg-white p-1 rounded-xl ring-1 ring-gray-200 flex items-center">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      {visibleProjects.length === 0 ? (
        <div className="p-6">
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5 ring-4 ring-gray-100">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
              {searchTerm || statusFilter !== "all"
                ? "No projects match your search criteria. Try adjusting your filters."
                : "Get started by creating your first construction project."}
            </p>
            {searchTerm || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="bg-white text-gray-900 ring-1 ring-gray-300 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Clear all filters
              </button>
            ) : (
              canManage &&
              onCreateProject && (
                <button
                  onClick={onCreateProject}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-black transition-colors text-sm"
                >
                  Create new project
                </button>
              )
            )}
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* ---------------------------- Table view ---------------------------- */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="border-b border-gray-200 bg-gray-50/60">
              <tr className="text-left">
                <SortHeader label="Project" sortAs="name" />
                <SortHeader label="Status" sortAs="status" />
                <SortHeader label="Capacity" sortAs="capacity" className="text-right" />
                <SortHeader label="Revenue" sortAs="revenue" className="text-right" />
                <SortHeader label="Timeline" sortAs="startDate" />
                <th scope="col" className="px-4 py-3 w-10" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {pageProjects.map((project) => {
                const progress = calculateProgress(project);
                return (
                  <tr
                    key={project.projectId}
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                    className="group hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* max-w bounds the column so long addresses ellipsize instead of
                        widening the table past the viewport. */}
                    <td className="px-4 py-3.5 max-w-[420px]">
                      <div className="font-semibold text-gray-900 group-hover:text-black truncate">
                        {project.projectName || "Unnamed Project"}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                        {project.clientInfo && (
                          <span className="truncate max-w-[200px] flex-shrink-0">
                            {project.clientInfo}
                          </span>
                        )}
                        {project.address && (
                          // min-w-0 lets the inner span actually ellipsize; without it
                          // the flex item refuses to shrink and the text hard-clips.
                          <span className="hidden lg:flex min-w-0 items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{project.address}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={project.status} />
                      {/* Only meaningful once a project actually has tasks. */}
                      {project.taskCount > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-gray-900 h-1.5 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {progress}%
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-gray-900 tabular-nums whitespace-nowrap">
                      {formatKw(project.totalCapacityKw)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-gray-900 tabular-nums whitespace-nowrap">
                      {formatBaht(project.revenueValue)}
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                      {formatDay(project.startDate)}
                      <span className="text-gray-400"> → </span>
                      {formatDay(project.estimatedEndDate)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="border-t-2 border-gray-200 bg-gray-50/60">
              <tr className="text-gray-900">
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {visibleProjects.length}
                  {visibleProjects.length === 1 ? " project" : " projects"}
                  {visibleProjects.length !== projects.length &&
                    ` of ${projects.length}`}
                </td>
                <td />
                <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap">
                  {formatKw(totals.capacity)}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums whitespace-nowrap">
                  {formatBaht(totals.revenue)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* ---------------------------- Grid view ----------------------------- */
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pageProjects.map((project) => {
            const progress = calculateProgress(project);
            return (
              <button
                key={project.projectId}
                onClick={() => navigate(`/projects/${project.projectId}`)}
                className="text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-900 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-gray-900 leading-snug line-clamp-2">
                    {project.projectName || "Unnamed Project"}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                </div>

                <div className="mt-2">
                  <StatusBadge status={project.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Capacity
                    </div>
                    <div className="mt-0.5 font-semibold text-gray-900 tabular-nums flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-gray-400" />
                      {formatKw(project.totalCapacityKw)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Revenue
                    </div>
                    <div className="mt-0.5 font-semibold text-gray-900 tabular-nums">
                      {formatBaht(project.revenueValue)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  {project.clientInfo && (
                    <div className="truncate">{project.clientInfo}</div>
                  )}
                  <div>
                    {formatDay(project.startDate)}
                    <span className="text-gray-400"> → </span>
                    {formatDay(project.estimatedEndDate)}
                  </div>
                </div>

                {project.taskCount > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gray-900 h-1.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 tabular-nums">
                      {progress}%
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {visibleProjects.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            –
            <span className="font-medium text-gray-900">
              {Math.min(currentPage * itemsPerPage, visibleProjects.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">
              {visibleProjects.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDisplay;
