import { useState, useEffect, useCallback } from "react";

export interface TaskFilter {
  status?: string;
  assigneeId?: string;
  dueDateAfter?: string;
  dueDateBefore?: string;
  search?: string;
  pageNumber: number;
  pageSize: number;
}

export interface Task {
  taskId: string;
  name: string;
  status: string;
  assignee: string;
  priority: string;
  dueDate: string;
  progress: number;
  projectId?: string;
}

export const useTaskManagement = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilter>({
    status: "",
    assigneeId: "",
    dueDateAfter: "",
    dueDateBefore: "",
    search: "",
    pageNumber: 1,
    pageSize: 50,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock tasks data
  const mockTasks: Task[] = [
    {
      taskId: "1",
      name: "Site Survey and Assessment",
      status: "completed",
      assignee: "John Doe",
      priority: "high",
      dueDate: "2024-02-15",
      progress: 100,
      projectId,
    },
    {
      taskId: "2",
      name: "Permit Applications",
      status: "in_progress",
      assignee: "Jane Smith",
      priority: "high",
      dueDate: "2024-03-01",
      progress: 75,
      projectId,
    },
    {
      taskId: "3",
      name: "Equipment Procurement",
      status: "pending",
      assignee: "Mike Johnson",
      priority: "medium",
      dueDate: "2024-03-15",
      progress: 0,
      projectId,
    },
    {
      taskId: "4",
      name: "Foundation Preparation",
      status: "pending",
      assignee: "Sarah Wilson",
      priority: "medium",
      dueDate: "2024-04-01",
      progress: 0,
      projectId,
    },
  ];

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter tasks based on current filters
      let filteredTasks = mockTasks;

      if (projectId) {
        filteredTasks = filteredTasks.filter(
          (task) => task.projectId === projectId
        );
      }

      if (filters.status) {
        filteredTasks = filteredTasks.filter(
          (task) => task.status === filters.status
        );
      }

      if (filters.search) {
        filteredTasks = filteredTasks.filter((task) =>
          task.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setTasks(filteredTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [projectId, filters]);

  const createTask = useCallback(
    async (taskData: Partial<Task>) => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newTask: Task = {
          taskId: Date.now().toString(),
          name: taskData.name || "New Task",
          status: taskData.status || "pending",
          assignee: taskData.assignee || "Unassigned",
          priority: taskData.priority || "medium",
          dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
          progress: taskData.progress || 0,
          projectId: projectId,
        };

        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        setTasks((prev) =>
          prev.map((task) =>
            task.taskId === taskId ? { ...task, ...updates } : task
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setTasks((prev) => prev.filter((task) => task.taskId !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTask = useCallback(
    async (taskId: string, notes?: string) => {
      try {
        await updateTask(taskId, { status: "completed", progress: 100 });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to complete task"
        );
        throw err;
      }
    },
    [updateTask]
  );

  useEffect(() => {
    // Fetch-on-mount: fetchTasks sets loading state before its first await
    // (imperative side-effect, not derived state).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    filters,
    loading,
    error,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refreshTasks: fetchTasks,
  };
};
