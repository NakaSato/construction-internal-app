import React, { useState } from "react";
import { ProjectEntity } from "../../../shared/types/project-management";

interface TaskManagerProps {
  project: ProjectEntity;
  onTaskCreate?: (taskData: any) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskDelete?: (taskId: string) => void;
}

interface TaskFilter {
  status: string;
  assignee: string;
  priority: string;
  search: string;
}

const mockTasks = [
  {
    id: "1",
    name: "Site Survey and Assessment",
    status: "completed",
    assignee: "John Doe",
    priority: "high",
    dueDate: "2024-02-15",
    progress: 100,
  },
  {
    id: "2",
    name: "Permit Applications",
    status: "in_progress",
    assignee: "Jane Smith",
    priority: "high",
    dueDate: "2024-03-01",
    progress: 75,
  },
  {
    id: "3",
    name: "Equipment Procurement",
    status: "pending",
    assignee: "Mike Johnson",
    priority: "medium",
    dueDate: "2024-03-15",
    progress: 0,
  },
  {
    id: "4",
    name: "Foundation Preparation",
    status: "pending",
    assignee: "Sarah Wilson",
    priority: "medium",
    dueDate: "2024-04-01",
    progress: 0,
  },
];

export const TaskManager: React.FC<TaskManagerProps> = ({
  project,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [filters, setFilters] = useState<TaskFilter>({
    status: "",
    assignee: "",
    priority: "",
    search: "",
  });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "calendar">(
    "list"
  );
  const [showTaskForm, setShowTaskForm] = useState(false);

  const filteredTasks = mockTasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.assignee && task.assignee !== filters.assignee) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (
      filters.search &&
      !task.name.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== taskId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Task controls and filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="px-3 py-1 border rounded-md text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "list"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 text-sm border-l ${
                  viewMode === "kanban"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1 text-sm border-l ${
                  viewMode === "calendar"
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                Calendar
              </button>
            </div>

            {selectedTasks.length > 0 && (
              <select className="px-3 py-1 border rounded-md text-sm bg-blue-50">
                <option>Bulk Actions ({selectedTasks.length})</option>
                <option>Mark Complete</option>
                <option>Assign to...</option>
                <option>Change Priority</option>
                <option>Delete</option>
              </select>
            )}

            <button
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <span className="mr-1">+</span>
              Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Tasks ({filteredTasks.length})
            </h3>
            <div className="text-sm text-gray-500">
              {selectedTasks.length > 0 && `${selectedTasks.length} selected`}
            </div>
          </div>
        </div>

        {viewMode === "list" && (
          <div className="divide-y">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={(e) =>
                      handleTaskSelect(task.id, e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {task.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Assigned to: {task.assignee} • Due: {task.dueDate}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500">
                          {task.progress}%
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <span className="sr-only">Edit</span>
                      ✏️
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <span className="sr-only">Delete</span>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-2xl mb-2">📋</div>
                <p>No tasks found matching your filters</p>
              </div>
            )}
          </div>
        )}

        {viewMode === "kanban" && (
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Kanban View Coming Soon
              </h4>
              <p className="text-sm">
                Drag-and-drop task management interface will be implemented in
                Phase 3.
              </p>
            </div>
          </div>
        )}

        {viewMode === "calendar" && (
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Calendar View Coming Soon
              </h4>
              <p className="text-sm">
                Calendar-based task scheduling will be implemented in Phase 3.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Task Creation Modal Placeholder */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create New Task
                </h3>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">🚧</div>
                <p>Task creation form will be implemented in Phase 3</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
