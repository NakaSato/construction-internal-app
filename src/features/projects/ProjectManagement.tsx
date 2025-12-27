import React, { useState, useMemo } from "react";
import { useAuth, useRole } from "../../shared/hooks/useAuth";
import { useProjects } from "../../shared/hooks/useProjects";
import { OverviewTab } from "../dashboard";
import ProjectsDisplay from "./ProjectsDisplay";
import ConstructionTab from "./ConstructionTab";
import ProgressDashboard from "./ProgressDashboard";
import GanttChartLoader from "./GanttChartLoader";
import { ReportsTab } from "../reports";
import {
  ProjectEntity,
  ProjectStatus,
} from "../../shared/types/project-management";
import {
  projectDtosToProjects,
  projectDtosToProjectEntities,
  projectDtoToProjectEntity,
} from "../../shared/utils/projectTypeAdapter";
import { AppShell } from "../../components/layout/AppShell";

// Tab definitions for internal navigation
const tabs: {
  id:
  | "overview"
  | "projects"
  | "construction"
  | "planning"
  | "reports"
  | "analytics";
  label: string;
  icon: string;
  description: string;
  requiredRole?: string[];
}[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "📊",
      description: "Project statistics and key metrics",
    },
    {
      id: "projects",
      label: "Projects",
      icon: "🏗️",
      description: "Manage all solar projects",
    },
    {
      id: "construction",
      label: "Construction",
      icon: "🔧",
      description: "Construction progress and activities",
    },
    {
      id: "planning",
      label: "Planning",
      icon: "📅",
      description: "Gantt charts and project timelines",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📈",
      description: "Generate and view project reports",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "📊",
      description: "Data analysis and insights",
      requiredRole: ["Admin", "Manager"],
    },
  ];

const ProjectManagement: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isManager, roleName } = useRole();
  const { projects, loading, error, refreshProjects } = useProjects();

  // Log project data changes for debugging
  React.useEffect(() => {
    // Projects data updated successfully
  }, [projects, loading, error]);

  // User context initialized

  // Internal state management
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "projects"
    | "construction"
    | "planning"
    | "reports"
    | "analytics"
  >("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [useEnhancedModal, setUseEnhancedModal] = useState(true);

  // Convert API project data to ProjectEntity format for internal components
  const projectEntities = useMemo(() => {
    return projectDtosToProjectEntities(projects);
  }, [projects]);

  // Get the first project entity for components that need a single project
  // In a real app, this would be selected based on user interaction or route params
  const selectedProjectEntity = useMemo(() => {
    if (projectEntities.length > 0) {
      return projectEntities[0];
    }

    // Fallback demo project only if no real projects exist
    return {
      projectId: "demo-001",
      projectName: "Demo Solar Installation",
      projectOwner: "Demo Owner",
      mainContractor: "Demo Contractor",
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      actualStartDate: new Date(),
      actualEndDate: undefined,
      status: ProjectStatus.IN_PROGRESS,
      overallCompletion: 0.25,
      phases: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ProjectEntity;
  }, [projectEntities]);

  // Sort projects - Logic moved to ProjectsDisplay
  // Pagination - Logic moved to ProjectsDisplay

  // Project statistics
  const projectStats = {
    totalProjects: projects.length,
    totalBudget: projects.reduce((sum, p) => sum + (p.revenueValue || 0), 0), // Using revenueValue as budget proxy
    totalSpent: projects.reduce((sum, p) => sum + (p.ftsValue || 0), 0), // Using ftsValue as spent proxy
    totalCapacity: projects.reduce((sum, p) => {
      return sum + (p.totalCapacityKw || 0);
    }, 0),
    budgetUtilization:
      projects.length > 0
        ? (projects.reduce((sum, p) => sum + (p.ftsValue || 0), 0) /
          Math.max(
            projects.reduce((sum, p) => sum + (p.revenueValue || 0), 0),
            1
          )) *
        100
        : 0,
    statusDistribution: projects.reduce((acc, project) => {
      const status = project.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Filter tabs based on user role
  const availableTabs = tabs.filter((tab) => {
    if (!tab.requiredRole) return true;
    return tab.requiredRole.includes(roleName || "");
  });

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = () => {
    setShowCreateModal(false);
    refreshProjects();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            projects={projects}
            stats={projectStats}
            statsLoading={loading}
            onViewAllProjects={() => setActiveTab("projects")}
          />
        );

      case "projects":
        return (
          <div className="space-y-6">
            <ProjectsDisplay
              projects={projects}
              loading={loading}
              error={error}
              onRefresh={refreshProjects}
              onCreateProject={handleCreateProject}
            />
          </div>
        );

      case "construction":
        return <ConstructionTab projects={projectDtosToProjects(projects)} />;

      case "planning":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Project Timeline & Planning
              </h3>
              <p className="text-gray-600 mb-6">
                Interactive Gantt chart for project planning and timeline
                management.
              </p>
              <GanttChartLoader project={selectedProjectEntity} />
            </div>
            <ProgressDashboard project={selectedProjectEntity} />
          </div>
        );

      case "reports":
        return <ReportsTab projects={projectDtosToProjects(projects)} />;

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 mb-6">
                Comprehensive data analysis and insights for project
                performance.
              </p>

              {/* Analytics Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <h4 className="text-lg font-semibold text-gray-700">
                      Budget Analysis
                    </h4>
                    <p className="text-gray-500">Budget vs Actual Spending</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">⏱️</div>
                    <h4 className="text-lg font-semibold text-gray-700">
                      Timeline Analysis
                    </h4>
                    <p className="text-gray-500">Schedule Performance</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <h4 className="text-lg font-semibold text-gray-700">
                      Performance Metrics
                    </h4>
                    <p className="text-gray-500">KPI Dashboard</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <h4 className="text-lg font-semibold text-gray-700">
                      Risk Analysis
                    </h4>
                    <p className="text-gray-500">Project Risk Assessment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="Project Dashboard"
    >
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12 h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <span className="text-lg text-gray-500 font-medium">
              Loading workspace...
            </span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {!loading && renderTabContent()}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all scale-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Project</h3>
              <p className="text-gray-500 mt-1">
                Enter the details to initialize a new construction project.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-blue-800 text-sm">
              ℹ️ This feature is currently simulating API integration.
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProjectCreated}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default ProjectManagement;
