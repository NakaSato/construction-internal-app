import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectDto } from "../../shared/types/project";
import { formatCapacity } from "../../shared/utils/projectHelpers";
import { useDailyReports } from "../../shared/hooks";
import { projectsApi } from "../../shared/utils/projectsApi";
import {
  Building2,
  Wallet,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronRight,
  Activity,
  Sun,
  Layers,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";

// Lazy-load map to defer leaflet + react-leaflet out of the dashboard chunk
const ProjectMap = lazy(() =>
  import("../../components/ui/ProjectMap").then((m) => ({
    default: m.ProjectMap,
  }))
);

interface ProjectStats {
  totalProjects: number;
  totalBudget: number;
  totalSpent: number;
  totalCapacity: number;
  budgetUtilization?: number;
  statusDistribution?: Record<string, number>;
}

interface OverviewTabProps {
  projects: ProjectDto[];
  stats?: ProjectStats | null;
  statsLoading?: boolean;
  onViewAllProjects?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/* -------------------------------------------------------------------------- */

// Consistent per-status visual identity, reused by the breakdown bar,
// the legend and the table badges so colours never drift apart.
const STATUS_META: Record<
  string,
  { label: string; bar: string; dot: string; badge: string }
> = {
  InProgress: {
    label: "In Progress",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  Construction: {
    label: "Construction",
    bar: "bg-orange-500",
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 ring-orange-600/20",
  },
  Planning: {
    label: "Planning",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20",
  },
  Design: {
    label: "Design",
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  },
  Completed: {
    label: "Completed",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  OnHold: {
    label: "On Hold",
    bar: "bg-slate-400",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
  Cancelled: {
    label: "Cancelled",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
};

const statusMeta = (status?: string | null) =>
  (status && STATUS_META[status]) || {
    label: status || "Unknown",
    bar: "bg-slate-300",
    dot: "bg-slate-300",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

const greetingFor = (h: number) =>
  h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

// Compact currency, e.g. ฿1.2M / ฿840K, tolerant of missing values.
const formatCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `฿${(value / 1_000).toFixed(0)}K`;
  return `฿${value.toFixed(0)}`;
};

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // gradient classes for the icon chip
  loading?: boolean;
}

const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  loading,
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    {/* faint corner glow */}
    <div
      className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-xl ${accent}`}
    />
    <div className="flex items-start justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${accent}`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
    </div>
    <div className="mt-3">
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded-md bg-slate-100" />
      ) : (
        <div className="text-3xl font-bold leading-none tracking-tight text-slate-900">
          {value}
        </div>
      )}
      {sub && <p className="mt-2 text-xs font-medium text-slate-400">{sub}</p>}
    </div>
  </div>
);

// Circular gauge for a 0–100 percentage.
const Gauge: React.FC<{ value: number; label: string; sub: string }> = ({
  value,
  label,
  sub,
}) => {
  const pct = Math.max(0, Math.min(100, value));
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const tone =
    pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-[76px] w-[76px] flex-shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 76 76">
            <circle
              cx="38"
              cy="38"
              r={r}
              fill="none"
              stroke="#eef2f6"
              strokeWidth="8"
            />
            <circle
              cx="38"
              cy="38"
              r={r}
              fill="none"
              stroke={tone}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-900">
              {pct.toFixed(0)}%
            </span>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-400">{sub}</p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

const OverviewTab: React.FC<OverviewTabProps> = ({
  projects,
  stats,
  statsLoading = false,
  onViewAllProjects,
}) => {
  const navigate = useNavigate();
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0);
  const { reports: recentReports } = useDailyReports();
  const now = new Date();

  // Active-projects count comes from a server-side filtered query so it stays
  // correct even when the page only holds the first page of projects.
  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const response = await projectsApi.getAllProjects({
          pageNumber: 1,
          pageSize: 1,
          status: "InProgress,Planning,OnHold",
        });
        if (!cancelled) setActiveProjectsCount(response.totalCount);
      } catch (error) {
        console.error("Error fetching count", error);
        if (!cancelled) setActiveProjectsCount(projects.length);
      }
    };
    fetchCount();
    return () => {
      cancelled = true;
    };
  }, [projects.length]);

  // ---- Derived portfolio metrics (all from real data) --------------------
  const metrics = useMemo(() => {
    const totalBudget =
      stats?.totalBudget ??
      projects.reduce((s, p) => s + (p.revenueValue || 0), 0);
    const totalSpent =
      stats?.totalSpent ?? projects.reduce((s, p) => s + (p.ftsValue || 0), 0);
    const totalCapacity =
      stats?.totalCapacity ??
      projects.reduce((s, p) => s + (p.totalCapacityKw || 0), 0);
    const budgetUtilization =
      stats?.budgetUtilization ??
      (totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0);

    const totalTasks = projects.reduce((s, p) => s + (p.taskCount || 0), 0);
    const doneTasks = projects.reduce(
      (s, p) => s + (p.completedTaskCount || 0),
      0
    );
    const completion = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    const statusCounts =
      stats?.statusDistribution ??
      projects.reduce<Record<string, number>>((acc, p) => {
        const key = p.status || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    const statusEntries = Object.entries(statusCounts).sort(
      (a, b) => b[1] - a[1]
    );

    return {
      totalBudget,
      totalSpent,
      totalCapacity,
      budgetUtilization,
      completion,
      statusEntries,
    };
  }, [projects, stats]);

  // Priority = active projects with the least progress surfaced first.
  const priorityProjects = useMemo(() => {
    const pctOf = (p: ProjectDto) =>
      p.taskCount > 0 ? (p.completedTaskCount / p.taskCount) * 100 : 0;
    return [...projects]
      .sort((a, b) => pctOf(a) - pctOf(b))
      .slice(0, 6);
  }, [projects]);

  const handleProjectClick = (projectId: string) =>
    navigate(`/projects/${projectId}`);

  const kpis = [
    {
      label: "Active Projects",
      value: activeProjectsCount,
      sub: `${projects.length} total in portfolio`,
      icon: Building2,
      accent: "bg-gradient-to-br from-sky-500 to-blue-600",
    },
    {
      label: "Installed Capacity",
      value: formatCapacity(metrics.totalCapacity),
      sub: "Total DC power across sites",
      icon: Sun,
      accent: "bg-gradient-to-br from-amber-400 to-orange-500",
    },
    {
      label: "Portfolio Revenue",
      value: formatCompact(metrics.totalBudget),
      sub: `${formatCompact(metrics.totalSpent)} committed to date`,
      icon: Wallet,
      accent: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header band ---------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-6 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-300/90">
              <Sun className="h-3.5 w-3.5" />
              Portfolio Overview
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white">
              {greetingFor(now.getHours())}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">Overall progress</p>
              <p className="text-2xl font-bold text-white">
                {metrics.completion.toFixed(0)}%
              </p>
            </div>
            <div className="hidden h-12 w-px bg-white/10 sm:block" />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-400">Capacity</p>
              <p className="text-2xl font-bold text-white">
                {formatCapacity(metrics.totalCapacity)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- KPI row -------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <StatTile key={kpi.label} loading={statsLoading} {...kpi} />
        ))}
        <Gauge
          value={metrics.budgetUtilization}
          label="Budget Utilization"
          sub={`${formatCompact(metrics.totalSpent)} of ${formatCompact(
            metrics.totalBudget
          )} used`}
        />
      </div>

      {/* ---- Map + status breakdown ----------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <MapPin className="h-4 w-4 text-slate-400" />
              Project Locations
            </h3>
            <button
              onClick={onViewAllProjects}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
            >
              View map <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative min-h-[360px] flex-1">
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                  Loading map…
                </div>
              }
            >
              <ProjectMap projects={projects} />
            </Suspense>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Layers className="h-4 w-4 text-slate-400" />
              Status Breakdown
            </h3>
            <span className="text-xs font-medium text-slate-400">
              {projects.length} projects
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5">
            {projects.length > 0 ? (
              <>
                {/* segmented bar */}
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  {metrics.statusEntries.map(([status, count]) => (
                    <div
                      key={status}
                      className={`h-full ${statusMeta(status).bar}`}
                      style={{
                        width: `${(count / projects.length) * 100}%`,
                      }}
                      title={`${statusMeta(status).label}: ${count}`}
                    />
                  ))}
                </div>

                {/* legend */}
                <ul className="mt-5 space-y-3">
                  {metrics.statusEntries.map(([status, count]) => {
                    const meta = statusMeta(status);
                    const pct = ((count / projects.length) * 100).toFixed(0);
                    return (
                      <li
                        key={status}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2.5 text-slate-600">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${meta.dot}`}
                          />
                          {meta.label}
                        </span>
                        <span className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-slate-900">
                            {count}
                          </span>
                          <span className="text-xs text-slate-400">
                            {pct}%
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-slate-400">
                <CircleDot className="mb-2 h-8 w-8 opacity-20" />
                <span className="text-sm">No projects yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Priority table + activity feed --------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Priority projects */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-slate-800">
              Priority Projects
            </h3>
            <button
              onClick={onViewAllProjects}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Completion</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {priorityProjects.map((project) => {
                  const pct =
                    project.taskCount > 0
                      ? Math.round(
                          (project.completedTaskCount / project.taskCount) * 100
                        )
                      : 0;
                  const meta = statusMeta(project.status);
                  return (
                    <tr
                      key={project.projectId}
                      className="cursor-pointer transition-colors hover:bg-slate-50/80"
                      onClick={() =>
                        handleProjectClick(project.projectId || "")
                      }
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600">
                            {project.projectName
                              ?.substring(0, 2)
                              .toUpperCase() || "—"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {project.projectName || "Untitled"}
                            </p>
                            {project.projectManagerName && (
                              <p className="truncate text-xs text-slate-400">
                                {project.projectManagerName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${meta.bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-9 text-xs font-medium text-slate-500">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                      </td>
                    </tr>
                  );
                })}
                {projects.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-slate-400"
                    >
                      No projects to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Clock className="h-4 w-4 text-slate-400" />
              Recent Updates
            </h3>
          </div>
          <div className="max-h-[380px] flex-1 overflow-y-auto p-3">
            {recentReports.length > 0 ? (
              <ol className="relative space-y-1 pl-2">
                {recentReports.slice(0, 6).map((report, idx) => (
                  <li
                    key={idx}
                    className="group relative rounded-lg p-2.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">
                            {report.userName || "User"}
                          </span>{" "}
                          submitted a report for{" "}
                          <span className="font-medium text-slate-900">
                            {report.projectName}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {new Date(report.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ·{" "}
                          {report.approvalStatus
                            ? String(report.approvalStatus)
                                .replace(/([A-Z])/g, " $1")
                                .trim()
                            : "Submitted"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-12 text-slate-400">
                <Activity className="mb-2 h-8 w-8 opacity-20" />
                <span className="text-sm">No recent activity</span>
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              142 days without a safety incident
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
