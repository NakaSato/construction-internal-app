import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectDto } from "../../shared/types/project";
import {
  getStatusColor,
  formatCapacity,
} from "../../shared/utils/projectHelpers";
import { useDailyReports } from "../../shared/hooks";
import { projectsApi } from "../../shared/utils/projectsApi";
import {
  Building2,
  Wallet,
  AlertTriangle,
  MapPin,
  Clock,
  ChevronRight,
  Activity
} from "lucide-react";

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

const OverviewTab: React.FC<OverviewTabProps> = ({
  projects,
  stats,
  statsLoading = false,
  onViewAllProjects,
}) => {
  const navigate = useNavigate();
  // State for active projects count
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0);

  // Get recent daily reports
  const { reports: recentReports } = useDailyReports();

  // Fetch active projects count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await projectsApi.getAllProjects({
          pageNumber: 1,
          pageSize: 1,
          status: "InProgress,Planning,OnHold",
        });
        setActiveProjectsCount(response.totalCount);
      } catch (error) {
        console.error("Error fetching count", error);
        setActiveProjectsCount(projects.length);
      }
    };
    fetchCount();
  }, [projects.length]);

  // Derived metrics
  const totalBudget = stats?.totalBudget ?? projects.reduce((sum, p) => sum + (p.revenueValue || 0), 0);
  const totalSpent = stats?.totalSpent ?? projects.reduce((sum, p) => sum + (p.ftsValue || 0), 0);
  const totalCapacity = stats?.totalCapacity ?? projects.reduce((sum, p) => sum + (p.totalCapacityKw || 0), 0);
  const budgetUtilization = stats?.budgetUtilization ?? (totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0);

  // Mock Safety Data
  const safetyIncidents = 0;
  const daysWithoutIncident = 142;

  // Simple, clean KPI cards
  const kpis = [
    {
      title: "Active Projects",
      value: activeProjectsCount,
      subValue: "Currently running",
      icon: Building2,
      iconColor: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      title: "Budget Utilization",
      value: `${budgetUtilization.toFixed(1)}%`,
      subValue: "Total budget usage",
      icon: Wallet,
      iconColor: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      title: "Total Capacity",
      value: formatCapacity(totalCapacity),
      subValue: "Installed power",
      icon: Activity,
      iconColor: "text-violet-600",
      bgClass: "bg-violet-50",
    },
    {
      title: "Safety Incidents",
      value: safetyIncidents,
      subValue: `${daysWithoutIncident} days safe`,
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgClass: "bg-amber-50",
    },
  ];

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${kpi.bgClass} flex-shrink-0`}>
              <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight mt-1">{kpi.value}</h3>
              <p className="text-xs text-gray-400 mt-1">{kpi.subValue}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Map - Simple Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              Project Locations
            </h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">View Map</button>
          </div>
          <div className="flex-1 min-h-[350px] bg-slate-50 relative flex items-center justify-center">
            {/* Simple Map Representation */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="text-center relative z-10">
              <div className="bg-white p-4 rounded-full shadow-sm inline-flex mb-3">
                <MapPin className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-gray-500 font-medium">Interactive Map</p>
              <p className="text-xs text-gray-400 mt-1">Showing location of {projects.length} sites</p>
            </div>
          </div>
        </div>

        {/* 3. Activity Feed - Clean List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              Recent Updates
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[350px] p-2">
            {recentReports.length > 0 ? (
              <div className="space-y-1">
                {recentReports.slice(0, 5).map((report, idx) => (
                  <div key={idx} className="p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-default">
                    <div className="flex gap-3">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-50"></div>
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{report.userName || "User"}</span> submitted a report for <span className="font-medium text-gray-900">{report.projectName}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {report.approvalStatus ? String(report.approvalStatus).replace(/([A-Z])/g, ' $1').trim() : "Submitted"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                <Activity className="h-8 w-8 mb-2 opacity-20" />
                <span className="text-sm">No recent activity</span>
              </div>
            )}
            {/* Fallback for empty state during dev */}
            {recentReports.length === 0 && (
              <div className="space-y-1">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="p-3 hover:bg-gray-50 rounded-lg transition-colors opacity-40">
                    <div className="flex gap-3">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-slate-300"></div>
                      <div>
                        <p className="text-sm text-gray-600">Project data update</p>
                        <p className="text-xs text-gray-400 mt-0.5">Just now</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Simple Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3
            className={`font-semibold text-gray-800 ${onViewAllProjects ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
            onClick={onViewAllProjects}
          >
            Priority Projects
          </h3>
          <button
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={onViewAllProjects}
          >
            View All Projects
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium tracking-wider">Project</th>
                <th className="px-6 py-3 font-medium tracking-wider">Status</th>
                <th className="px-6 py-3 font-medium tracking-wider">Completion</th>
                <th className="px-6 py-3 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.slice(0, 5).map((project) => (
                <tr
                  key={project.projectId}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                  onClick={() => handleProjectClick(project.projectId || "")}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 font-bold text-xs">
                        {project.projectName?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{project.projectName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(project.status || "Unknown")}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{
                            width: `${project.taskCount > 0 ? (project.completedTaskCount / project.taskCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {project.taskCount > 0 ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectClick(project.projectId || "");
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No projects to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
