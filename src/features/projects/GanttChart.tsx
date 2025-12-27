import { useState, useEffect, useMemo } from "react";
import {
  ProjectEntity,
  GanttTask,
  GanttData,
  TaskDependency,
  DependencyType,
  ActivityStatus,
} from "../../shared/types/project-management";
import { ProgressCalculationEngine } from "../../shared/utils/progressCalculation";

interface GanttChartProps {
  project: ProjectEntity;
  showBaseline?: boolean;
  showCriticalPath?: boolean;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  viewMode?: "days" | "weeks" | "months";
}

interface GanttChartState {
  tasks: GanttTask[];
  timeline: {
    start: Date;
    end: Date;
    totalDays: number;
  };
  criticalPath: string[];
}

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export default function GanttChart({
  project,
  showBaseline = true,
  showCriticalPath = true,
  onTaskUpdate,
  viewMode = "weeks",
}: GanttChartProps) {
  const [ganttState, setGanttState] = useState<GanttChartState | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Convert project to Gantt data
  useEffect(() => {
    const ganttData = convertProjectToGanttData(project);
    const criticalPath =
      ProgressCalculationEngine.calculateCriticalPath(project);

    setGanttState({
      tasks: ganttData.tasks,
      timeline: {
        ...ganttData.timeline,
        totalDays: Math.ceil(
          (ganttData.timeline.end.getTime() -
            ganttData.timeline.start.getTime()) /
          (1000 * 60 * 60 * 24)
        ),
      },
      criticalPath,
    });
  }, [project]);

  const convertProjectToGanttData = (proj: ProjectEntity): GanttData => {
    const tasks: GanttTask[] = [];

    // Add project as root task
    tasks.push({
      id: proj.projectId,
      name: proj.projectName,
      start: proj.plannedStartDate,
      end: proj.plannedEndDate,
      progress: proj.overallCompletion,
      type: "project",
      isOnCriticalPath: false,
      baseline: {
        start: proj.plannedStartDate,
        end: proj.plannedEndDate,
      },
    });

    // Add phases as level 1 tasks
    proj.phases.forEach((phase) => {
      const phaseCompletion =
        ProgressCalculationEngine.calculatePhaseCompletion(phase);

      tasks.push({
        id: phase.phaseId,
        name: phase.phaseName,
        start: phase.startDate,
        end: phase.endDate,
        progress: phaseCompletion,
        type: "phase",
        parent: proj.projectId,
        isOnCriticalPath: false,
        baseline: {
          start: phase.startDate,
          end: phase.endDate,
        },
      });

      // Add activities as level 2 tasks
      phase.activities.forEach((activity) => {
        tasks.push({
          id: activity.activityId,
          name: activity.activityName,
          start: activity.startDate,
          end: activity.endDate,
          progress: activity.percentComplete,
          type: "activity",
          parent: phase.phaseId,
          dependencies: activity.dependencies.map((dep) => dep.predecessorId),
          resources: activity.assignedResources,
          isOnCriticalPath: activity.isOnCriticalPath,
          baseline: {
            start: activity.startDate,
            end: activity.endDate,
          },
        });
      });
    });

    // Calculate timeline
    const allDates = tasks.flatMap((task) => [task.start, task.end]);
    const timelineStart = new Date(
      Math.min(...allDates.map((d) => d.getTime()))
    );
    const timelineEnd = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const totalDays = Math.ceil(
      (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      tasks,
      resources: [], // Would be populated from project resources
      dependencies: proj.phases.flatMap((p) =>
        p.activities.flatMap((a) => a.dependencies)
      ),
      timeline: {
        start: timelineStart,
        end: timelineEnd,
      },
    };
  };

  // Generate time scale based on view mode
  const generateTimeScale = useMemo(() => {
    if (!ganttState) return [];

    const { start, end } = ganttState.timeline;
    const scale: Array<{ date: Date; label: string; isWeekend?: boolean }> = [];

    let currentDate = new Date(start);

    switch (viewMode) {
      case "days":
        while (currentDate <= end) {
          scale.push({
            date: new Date(currentDate),
            label: currentDate.getDate().toString(),
            isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;

      case "weeks":
        // Set to start of week (Monday)
        currentDate.setDate(
          currentDate.getDate() - ((currentDate.getDay() + 6) % 7)
        );
        while (currentDate <= end) {
          scale.push({
            date: new Date(currentDate),
            label: `W${getWeekNumber(currentDate)}`,
          });
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;

      case "months":
        currentDate.setDate(1);
        while (currentDate <= end) {
          scale.push({
            date: new Date(currentDate),
            label: currentDate.toLocaleDateString("en-US", { month: "short" }),
          });
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;
    }

    return scale;
  }, [ganttState, viewMode]);



  // Calculate task position and width
  const getTaskPosition = (task: GanttTask) => {
    if (!ganttState) return { left: 0, width: 0 };

    const { start: timelineStart } = ganttState.timeline;
    const totalTimelineWidth = generateTimeScale.length;

    const taskStart =
      (task.start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    const taskDuration =
      (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24);

    const unitWidth = 100 / totalTimelineWidth; // Percentage per time unit

    return {
      left: (taskStart / totalTimelineWidth) * 100,
      width: Math.max((taskDuration / totalTimelineWidth) * 100, 1), // Minimum 1% width
    };
  };

  // Get task style based on type and status
  const getTaskStyle = (task: GanttTask) => {
    let backgroundColor = "#3B82F6"; // Default blue
    let borderColor = "#2563EB";

    if (showCriticalPath && ganttState?.criticalPath.includes(task.id)) {
      backgroundColor = "#EF4444"; // Red for critical path
      borderColor = "#DC2626";
    } else {
      switch (task.type) {
        case "project":
          backgroundColor = "#8B5CF6"; // Purple
          borderColor = "#7C3AED";
          break;
        case "phase":
          backgroundColor = "#10B981"; // Green
          borderColor = "#059669";
          break;
        case "activity": {
          // Check activity status
          const activity = project.phases
            .flatMap((p) => p.activities)
            .find((a) => a.activityId === task.id);

          if (activity) {
            switch (activity.status) {
              case ActivityStatus.COMPLETED:
                backgroundColor = "#10B981"; // Green
                borderColor = "#059669";
                break;
              case ActivityStatus.OVERDUE:
                backgroundColor = "#EF4444"; // Red
                borderColor = "#DC2626";
                break;
              case ActivityStatus.BLOCKED:
                backgroundColor = "#F59E0B"; // Orange
                borderColor = "#D97706";
                break;
              default:
                backgroundColor = "#3B82F6"; // Blue
                borderColor = "#2563EB";
            }
          }
          break;
        }
      }
    }

    return { backgroundColor, borderColor };
  };

  // Render dependency lines
  const renderDependencies = () => {
    if (!ganttState) return null;

    return ganttState.tasks
      .filter((task) => task.dependencies && task.dependencies.length > 0)
      .map((task) =>
        task.dependencies!.map((depId) => {
          const predecessor = ganttState.tasks.find((t) => t.id === depId);
          if (!predecessor) return null;

          const successorPos = getTaskPosition(task);
          const predecessorPos = getTaskPosition(predecessor);

          // Simple line connection (would be more sophisticated in real implementation)
          return (
            <div
              key={`${depId}-${task.id}`}
              className="absolute border-t-2 border-gray-400 pointer-events-none"
              style={{
                left: `${predecessorPos.left + predecessorPos.width}%`,
                top: "50%",
                width: `${successorPos.left -
                  (predecessorPos.left + predecessorPos.width)
                  }%`,
                zIndex: 1,
              }}
            />
          );
        })
      );
  };

  if (!ganttState) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            📊 Project Gantt Chart
          </h3>
          <div className="flex items-center space-x-4">
            <select
              value={viewMode}
              onChange={(e) => {
                /* Update view mode */
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>

            <div className="flex items-center space-x-2 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCriticalPath}
                  onChange={(e) => {
                    /* Toggle critical path */
                  }}
                  className="mr-2"
                />
                Critical Path
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showBaseline}
                  onChange={(e) => {
                    /* Toggle baseline */
                  }}
                  className="mr-2"
                />
                Baseline
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Content */}
      <div className="flex">
        {/* Task List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium">
            Tasks
          </div>
          <div className="max-h-96 overflow-y-auto">
            {ganttState.tasks.map((task) => (
              <div
                key={task.id}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedTask === task.id ? "bg-blue-50 border-blue-200" : ""
                  } ${task.type === "phase"
                    ? "pl-8"
                    : task.type === "activity"
                      ? "pl-12"
                      : ""
                  }`}
                onClick={() => setSelectedTask(task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">
                      {task.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.start.toLocaleDateString()} -{" "}
                      {task.end.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round(task.progress * 100)}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-x-auto">
          {/* Time scale header */}
          <div className="bg-gray-100 border-b border-gray-200 h-12 flex">
            {generateTimeScale.map((timeUnit, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-16 text-center text-xs py-3 border-r border-gray-200 ${timeUnit.isWeekend ? "bg-gray-200" : ""
                  }`}
              >
                {timeUnit.label}
              </div>
            ))}
          </div>

          {/* Task bars */}
          <div className="relative max-h-96 overflow-y-auto">
            {ganttState.tasks.map((task, taskIndex) => {
              const position = getTaskPosition(task);
              const style = getTaskStyle(task);

              return (
                <div
                  key={task.id}
                  className="relative h-12 border-b border-gray-100 flex items-center"
                  style={{ minWidth: `${generateTimeScale.length * 64}px` }}
                >
                  {/* Weekend background */}
                  {generateTimeScale.map((timeUnit, index) => (
                    <div
                      key={index}
                      className={`absolute w-16 h-full ${timeUnit.isWeekend ? "bg-gray-50" : ""
                        }`}
                      style={{ left: `${index * 64}px` }}
                    />
                  ))}

                  {/* Baseline bar (if enabled) */}
                  {showBaseline && task.baseline && (
                    <div
                      className="absolute h-2 bg-gray-300 rounded opacity-50"
                      style={{
                        left: `${position.left}%`,
                        width: `${position.width}%`,
                        top: "8px",
                      }}
                    />
                  )}

                  {/* Main task bar */}
                  <div
                    className={`absolute h-6 rounded shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${selectedTask === task.id ? "ring-2 ring-blue-400" : ""
                      }`}
                    style={{
                      left: `${position.left}%`,
                      width: `${position.width}%`,
                      backgroundColor: style.backgroundColor,
                      borderColor: style.borderColor,
                      border: `2px solid ${style.borderColor}`,
                    }}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    {/* Progress fill */}
                    <div
                      className="h-full bg-white bg-opacity-30 rounded-sm"
                      style={{ width: `${task.progress * 100}%` }}
                    />

                    {/* Task label */}
                    {position.width > 10 && (
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-white text-xs font-medium truncate">
                          {task.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Critical path indicator */}
                  {showCriticalPath &&
                    ganttState.criticalPath.includes(task.id) && (
                      <div
                        className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full"
                        style={{ left: `${position.left}%` }}
                      />
                    )}
                </div>
              );
            })}

            {/* Dependency lines */}
            {renderDependencies()}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span>Project</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Phase</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Activity</span>
            </div>
            {showCriticalPath && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>Critical Path</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Timeline: {ganttState.timeline.start.toLocaleDateString()} -{" "}
            {ganttState.timeline.end.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
