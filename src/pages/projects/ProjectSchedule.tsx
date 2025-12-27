import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import ProtectedRoute from "@features/auth/ProtectedRoute";
import { ProjectEntity, ProjectStatus } from "@shared/types/project-management";
import { useProjectSchedule } from "@hooks/useProjectSchedule";
import {
  ScheduleOverview,
  TaskManager,
  ProgressAnalytics,
  KPIDashboard,
} from "@features/projects/schedule";

// Tab configuration
const SCHEDULE_TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "tasks", label: "Tasks", icon: "✅" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "analytics", label: "Analytics", icon: "🎯" },
] as const;

type ScheduleTab = (typeof SCHEDULE_TABS)[number]["id"];

interface ScheduleHeaderProps {
  project: ProjectEntity | null;
  loading: boolean;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  project,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="text-red-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => navigate("/projects/realtime")}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Projects
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    {project.projectName}
                  </button>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="text-gray-400">/</span>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Schedule
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {project.projectName} - Schedule Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Status: <span className="font-medium">{project.status}</span> •
            Owner: {project.projectOwner} • Contractor: {project.mainContractor}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.status === ProjectStatus.IN_PROGRESS
                ? "bg-blue-100 text-blue-800"
                : project.status === ProjectStatus.PLANNING
                ? "bg-blue-100 text-blue-800"
                : project.status === ProjectStatus.COMPLETED
                ? "bg-gray-100 text-gray-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>
    </div>
  );
};

interface TabNavigationProps {
  tabs: typeof SCHEDULE_TABS;
  activeTab: ScheduleTab;
  onTabChange: (tab: ScheduleTab) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

interface TabContentProps {
  currentTab: ScheduleTab;
  project: ProjectEntity | null;
  loading: boolean;
  error: string | null;
}

const TabContent: React.FC<TabContentProps> = ({
  currentTab,
  project,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Schedule
          </h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Project Not Found
          </h3>
          <p className="text-gray-600">
            The requested project could not be found.
          </p>
        </div>
      </div>
    );
  }

  // Render content based on active tab
  switch (currentTab) {
    case "overview":
      return (
        <ScheduleOverview
          project={project}
          criticalPath={["task1", "task2", "task3"]} // Mock critical path
          onTaskUpdate={(taskId, updates) => {
            // Task update handled by parent component
          }}
        />
      );

    case "tasks":
      return (
        <TaskManager
          project={project}
          onTaskCreate={(taskData) => {
            // Task creation handled by parent component
          }}
          onTaskUpdate={(taskId, updates) => {
            // Task update handled by parent component
          }}
          onTaskDelete={(taskId) => {
            // Task deletion handled by parent component
          }}
        />
      );

    case "progress":
      return <ProgressAnalytics project={project} showDetailed={true} />;

    case "analytics":
      return <KPIDashboard project={project} />;

    default:
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Tab content not implemented</p>
        </div>
      );
  }
};

const ProjectSchedulePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedTab, setSelectedTab] = useState<ScheduleTab>("overview");

  // Use the schedule hook (will be implemented)
  const { schedule, loading, error, refreshSchedule } = useProjectSchedule(
    projectId || ""
  );

  // Handle tab changes with URL synchronization (future enhancement)
  const handleTabChange = (tab: ScheduleTab) => {
    setSelectedTab(tab);
    // Future: Update URL with tab parameter
  };

  useEffect(() => {
    // Future: Read tab from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") as ScheduleTab;
    if (tabParam && SCHEDULE_TABS.some((tab) => tab.id === tabParam)) {
      setSelectedTab(tabParam);
    }
  }, []);

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Invalid Project ID
          </h2>
          <p className="text-gray-600 mt-2">
            Please select a valid project to view its schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="project-schedule-page min-h-screen bg-gray-50">
        {/* Header with project context and breadcrumbs */}
        <ScheduleHeader project={schedule?.project || null} loading={loading} />

        {/* Navigation tabs */}
        <TabNavigation
          tabs={SCHEDULE_TABS}
          activeTab={selectedTab}
          onTabChange={handleTabChange}
        />

        {/* Dynamic content area */}
        <div className="container mx-auto px-4 py-6">
          <TabContent
            currentTab={selectedTab}
            project={schedule?.project || null}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProjectSchedulePage;
