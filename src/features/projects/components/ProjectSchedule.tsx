import React, { useState } from "react";
import { ProjectDto } from "../../../shared/types/project";

interface ProjectScheduleProps {
  project: ProjectDto;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskCreate?: (taskData: any) => void;
  onTaskDelete?: (taskId: string) => void;
}

const ProjectSchedule = ({
  project,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
}: ProjectScheduleProps) => {
  const [activeView, setActiveView] = useState<"overview" | "gantt" | "tasks">(
    "overview"
  );

  // Calculate project timeline
  const startDate = new Date(project.startDate);
  const endDate = project.estimatedEndDate
    ? new Date(project.estimatedEndDate)
    : new Date();
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.ceil(
    (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercentage =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  const viewTabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "gantt", label: "Timeline", icon: "📈" },
    { id: "tasks", label: "Tasks", icon: "✅" },
  ];

  // Generate mock timeline data for display
  const generateTimelineData = () => {
    const phases = [
      {
        name: "Planning & Design",
        duration: 15,
        status: "completed",
        color: "bg-blue-500",
      },
      {
        name: "Procurement",
        duration: 20,
        status: "in-progress",
        color: "bg-blue-500",
      },
      {
        name: "Installation",
        duration: 30,
        status: "pending",
        color: "bg-gray-400",
      },
      {
        name: "Testing & Commissioning",
        duration: 10,
        status: "pending",
        color: "bg-gray-400",
      },
    ];

    let currentDate = new Date(startDate);
    return phases.map((phase) => {
      const phaseStart = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + phase.duration);
      const phaseEnd = new Date(currentDate);

      return {
        ...phase,
        startDate: phaseStart,
        endDate: phaseEnd,
        progress:
          phase.status === "completed"
            ? 100
            : phase.status === "in-progress"
            ? 60
            : 0,
      };
    });
  };

  const timelineData = generateTimelineData();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">Progress</div>
          <div className="text-2xl font-bold text-blue-900">
            {progressPercentage}%
          </div>
          <div className="text-blue-600 text-xs mt-1">
            {project.completedTaskCount} of {project.taskCount} tasks
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">Start Date</div>
          <div className="text-lg font-bold text-blue-900">
            {startDate.toLocaleDateString()}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-orange-600 text-sm font-medium">Target End</div>
          <div className="text-lg font-bold text-orange-900">
            {endDate.toLocaleDateString()}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-purple-600 text-sm font-medium">Duration</div>
          <div className="text-lg font-bold text-purple-900">
            {totalDays} days
          </div>
          <div className="text-purple-600 text-xs mt-1">
            {daysElapsed} elapsed
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Project Phases
        </h4>
        <div className="space-y-4">
          {timelineData.map((phase, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{phase.name}</span>
                <span className="text-sm text-gray-600">
                  {phase.startDate.toLocaleDateString()} -{" "}
                  {phase.endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${phase.color} transition-all duration-300`}
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span
                  className={`capitalize px-2 py-1 rounded text-xs font-medium ${
                    phase.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : phase.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {phase.status.replace("-", " ")}
                </span>
                <span className="text-gray-600">
                  {phase.progress}% complete
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGanttChart = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h4 className="font-medium text-gray-900">Project Timeline</h4>
      </div>

      {/* Simplified Gantt Chart */}
      <div className="p-4">
        <div className="grid grid-cols-12 gap-1 mb-4 text-xs text-gray-600">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="text-center">
              Week {i + 1}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {timelineData.map((phase, index) => (
            <div key={index} className="grid grid-cols-12 gap-1 items-center">
              <div className="col-span-3 text-sm font-medium text-gray-900 truncate">
                {phase.name}
              </div>
              <div className="col-span-9 relative">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${phase.color} rounded-lg flex items-center px-2`}
                    style={{ width: `${(phase.duration / 75) * 100}%` }}
                  >
                    <div
                      className="h-full bg-white bg-opacity-30 rounded"
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </div>
                <div className="absolute inset-y-0 left-2 flex items-center">
                  <span className="text-white text-xs font-medium">
                    {phase.duration}d
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Task Management</h4>
        <button
          onClick={() => onTaskCreate && onTaskCreate({})}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Task
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
            <div>Task Name</div>
            <div>Status</div>
            <div>Assigned To</div>
            <div>Due Date</div>
            <div>Actions</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Mock task data based on project info */}
          {Array.from({ length: Math.min(project.taskCount, 5) }, (_, i) => (
            <div key={i} className="px-4 py-3 hover:bg-gray-50">
              <div className="grid grid-cols-5 gap-4 text-sm items-center">
                <div className="font-medium text-gray-900">
                  Task {i + 1} - {timelineData[i % timelineData.length]?.name}
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      i < project.completedTaskCount
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {i < project.completedTaskCount
                      ? "Completed"
                      : "In Progress"}
                  </span>
                </div>
                <div className="text-gray-600">
                  {project.projectManager?.fullName || "Unassigned"}
                </div>
                <div className="text-gray-600">
                  {new Date(
                    Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onTaskUpdate && onTaskUpdate(`task-${i}`, {})
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onTaskDelete && onTaskDelete(`task-${i}`)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {project.taskCount === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No tasks available. Click "Add Task" to create the first task.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Project Schedule
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage project timeline, tasks, and milestones
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 mt-4">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeView === tab.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === "overview" && renderOverview()}
        {activeView === "gantt" && renderGanttChart()}
        {activeView === "tasks" && renderTasks()}
      </div>
    </div>
  );
};

export default ProjectSchedule;
