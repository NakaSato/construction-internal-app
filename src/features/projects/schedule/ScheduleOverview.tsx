import React from "react";
import { ProjectEntity } from "../../../shared/types/project-management";

interface ScheduleOverviewProps {
  project: ProjectEntity;
  criticalPath?: string[];
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

export const ScheduleOverview: React.FC<ScheduleOverviewProps> = ({
  project,
  criticalPath = [],
  onTaskUpdate,
}) => {
  // Calculate project health metrics
  const scheduleHealth = {
    status:
      project.overallCompletion > 0.8
        ? "healthy"
        : project.overallCompletion > 0.4
        ? "warning"
        : "critical",
    criticalTasks: criticalPath.length,
    completion: Math.round(project.overallCompletion * 100),
    daysRemaining: Math.ceil(
      (project.plannedEndDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "critical":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Project health status cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div
          className={`border rounded-lg p-4 ${getStatusColor(
            scheduleHealth.status
          )}`}
        >
          <div className="font-medium">Schedule Health</div>
          <div className="text-2xl font-bold capitalize">
            {scheduleHealth.status}
          </div>
        </div>
        <div
          className={`border rounded-lg p-4 ${
            scheduleHealth.criticalTasks > 5
              ? "bg-red-50 border-red-200 text-red-800"
              : scheduleHealth.criticalTasks > 0
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="font-medium">Critical Tasks</div>
          <div className="text-2xl font-bold">
            {scheduleHealth.criticalTasks}
          </div>
        </div>
        <div
          className={`border rounded-lg p-4 ${
            scheduleHealth.completion >= 80
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : scheduleHealth.completion >= 40
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="font-medium">Completion</div>
          <div className="text-2xl font-bold">{scheduleHealth.completion}%</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800">
          <div className="font-medium">Days Remaining</div>
          <div className="text-2xl font-bold">
            {Math.max(0, scheduleHealth.daysRemaining)}
          </div>
        </div>
      </div>

      {/* Interactive Gantt Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Project Timeline
            </h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">
                Days
              </button>
              <button className="px-3 py-1 text-sm border rounded-md bg-blue-50 text-blue-600">
                Weeks
              </button>
              <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">
                Months
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Gantt Chart Coming Soon
            </h4>
            <p className="text-sm">
              Interactive timeline visualization with critical path analysis
              will be implemented in Phase 2.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Features: Drag-and-drop scheduling, dependency management,
              resource allocation
            </div>
          </div>
        </div>
      </div>

      {/* Critical path and milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Path View */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Critical Path</h3>
          </div>
          <div className="p-4">
            {criticalPath.length > 0 ? (
              <div className="space-y-2">
                {criticalPath.slice(0, 5).map((taskId, index) => (
                  <div
                    key={taskId}
                    className="flex items-center space-x-3 p-2 bg-red-50 rounded-md"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-medium text-red-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Task {taskId}
                      </div>
                      <div className="text-xs text-gray-500">
                        Critical dependency
                      </div>
                    </div>
                  </div>
                ))}
                {criticalPath.length > 5 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{criticalPath.length - 5} more critical tasks
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm">No critical path issues detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[
                {
                  name: "Project Kickoff",
                  date: project.plannedStartDate,
                  status: "completed",
                },
                {
                  name: "Design Phase Complete",
                  date: new Date(
                    project.plannedStartDate.getTime() +
                      30 * 24 * 60 * 60 * 1000
                  ),
                  status: "completed",
                },
                {
                  name: "Construction Start",
                  date: new Date(
                    project.plannedStartDate.getTime() +
                      60 * 24 * 60 * 60 * 1000
                  ),
                  status: "in_progress",
                },
                {
                  name: "Testing Phase",
                  date: new Date(
                    project.plannedEndDate.getTime() - 30 * 24 * 60 * 60 * 1000
                  ),
                  status: "pending",
                },
                {
                  name: "Project Completion",
                  date: project.plannedEndDate,
                  status: "pending",
                },
              ].map((milestone, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`flex-shrink-0 w-3 h-3 rounded-full ${
                      milestone.status === "completed"
                        ? "bg-blue-500"
                        : milestone.status === "in_progress"
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {milestone.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {milestone.date.toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      milestone.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : milestone.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {milestone.status.replace("_", " ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
