import { useState, useEffect, useCallback } from "react";
import { SolarProjectApi } from "../api/solarProjectApi";
import {
  ProjectDto,
  GetProjectsParams,
  ProjectStatusDto,
  ProjectAnalyticsDto,
  ProjectPerformanceDto,
  ProjectTemplateDto,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateProjectFromTemplateRequest,
  ProjectSearchRequest,
  ProjectSearchResponse,
  UpdateProjectStatusRequest,
  ProjectAnalyticsParams,
  RealTimeProjectUpdate,
  ProjectStatusWorkflow,
  BulkProjectOperation,
  ProjectValidationResult,
  ProjectUpdateNotification,
} from "../types/project";
import { ApiResponse, EnhancedPagedResult } from "../types/api";

// Create a singleton instance of the API client
const apiClient = new SolarProjectApi();

/**
 * Enhanced hook for project management with comprehensive features
 */
export const useProjects = (params?: GetProjectsParams) => {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjects(params);

      if (response.success && response.data) {
        setProjects(response.data.items || []);
        setPagination({
          totalCount: response.data.totalCount,
          pageNumber: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages,
          hasPreviousPage: response.data.hasPreviousPage,
          hasNextPage: response.data.hasNextPage,
        });
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (
    projectData: CreateProjectRequest
  ): Promise<ProjectDto | null> => {
    try {
      setError(null);
      const response = await apiClient.createProject(projectData);

      if (response.success && response.data) {
        // Refresh the projects list
        await fetchProjects();
        return response.data;
      } else {
        setError(response.message || "Failed to create project");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      return null;
    }
  };

  const updateProject = async (
    id: string,
    projectData: UpdateProjectRequest
  ): Promise<ProjectDto | null> => {
    try {
      setError(null);
      const response = await apiClient.updateProject(id, projectData);

      if (response.success && response.data) {
        // Update the project in the local state
        setProjects((prev) =>
          prev.map((p) => (p.projectId === id ? response.data! : p))
        );
        return response.data;
      } else {
        setError(response.message || "Failed to update project");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
      return null;
    }
  };

  const patchProject = async (
    id: string,
    updates: Partial<UpdateProjectRequest>
  ): Promise<ProjectDto | null> => {
    try {
      setError(null);
      const response = await apiClient.patchProject(id, updates);

      if (response.success && response.data) {
        // Update the project in the local state
        setProjects((prev) =>
          prev.map((p) => (p.projectId === id ? response.data! : p))
        );
        return response.data;
      } else {
        setError(response.message || "Failed to update project");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiClient.deleteProject(id);

      if (response.success) {
        // Remove the project from local state
        setProjects((prev) => prev.filter((p) => p.projectId !== id));
        return true;
      } else {
        setError(response.message || "Failed to delete project");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      return false;
    }
  };

  return {
    projects,
    loading,
    error,
    pagination,
    refetch: fetchProjects,
    createProject,
    updateProject,
    patchProject,
    deleteProject,
  };
};

/**
 * Hook for managing a single project
 */
export const useProject = (projectId: string | null) => {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProject(projectId);

      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError(response.message || "Failed to fetch project");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
  };
};

/**
 * Hook for project status management
 */
export const useProjectStatus = (projectId: string | null) => {
  const [status, setStatus] = useState<ProjectStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjectStatus(projectId);

      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        setError(response.message || "Failed to fetch project status");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch project status"
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const updateStatus = async (statusUpdate: UpdateProjectStatusRequest) => {
    if (!projectId) return false;

    try {
      setError(null);
      const response = await apiClient.updateProjectStatus(
        projectId,
        statusUpdate
      );

      if (response.success) {
        // Refresh status
        await fetchStatus();
        return true;
      } else {
        setError(response.message || "Failed to update project status");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update project status"
      );
      return false;
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    updateStatus,
  };
};

/**
 * Hook for project analytics
 */
export const useProjectAnalytics = (params?: ProjectAnalyticsParams) => {
  const [analytics, setAnalytics] = useState<ProjectAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjectAnalytics(params);

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.message || "Failed to fetch project analytics");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch project analytics"
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

/**
 * Hook for project performance tracking
 */
export const useProjectPerformance = (projectId: string | null) => {
  const [performance, setPerformance] = useState<ProjectPerformanceDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjectPerformance(projectId);

      if (response.success && response.data) {
        setPerformance(response.data);
      } else {
        setError(response.message || "Failed to fetch project performance");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch project performance"
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchPerformance();
  }, [fetchPerformance]);

  return {
    performance,
    loading,
    error,
    refetch: fetchPerformance,
  };
};

/**
 * Hook for project templates
 */
export const useProjectTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjectTemplates();

      if (response.success && response.data) {
        setTemplates(response.data.templates || []);
      } else {
        setError(response.message || "Failed to fetch project templates");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch project templates"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createFromTemplate = async (
    templateId: string,
    projectData: CreateProjectFromTemplateRequest
  ): Promise<ProjectDto | null> => {
    try {
      setError(null);
      const response = await apiClient.createProjectFromTemplate(
        templateId,
        projectData
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to create project from template");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create project from template"
      );
      return null;
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createFromTemplate,
  };
};

/**
 * Hook for project search
 */
export const useProjectSearch = () => {
  const [results, setResults] = useState<ProjectSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (searchRequest: ProjectSearchRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.searchProjects(searchRequest);

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.message || "Search failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
};

/**
 * Hook for user's projects
 */
export const useMyProjects = (params?: {
  pageNumber?: number;
  pageSize?: number;
}) => {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchMyProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMyProjects(params);

      if (response.success && response.data) {
        setProjects(response.data.items || []);
        setPagination({
          totalCount: response.data.totalCount,
          pageNumber: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages,
          hasPreviousPage: response.data.hasPreviousPage,
          hasNextPage: response.data.hasNextPage,
        });
      } else {
        setError(response.message || "Failed to fetch my projects");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch my projects"
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchMyProjects();
  }, [fetchMyProjects]);

  return {
    projects,
    loading,
    error,
    pagination,
    refetch: fetchMyProjects,
  };
};

/**
 * Hook for real-time project updates with SignalR/WebSocket integration
 */
export const useRealTimeProjects = (
  projectIds?: string[],
  enabled: boolean = true
) => {
  const [updates, setUpdates] = useState<RealTimeProjectUpdate[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't start polling if disabled
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of polling state when disabled; preserves existing behavior
      setConnected(false);
      setUpdates([]);
      setError(null);
      return;
    }

    let intervalId: number;
    let endpointAvailable = true; // Flag to track if endpoint exists

    const pollForUpdates = async () => {
      if (!endpointAvailable) return; // Don't poll if endpoint doesn't exist

      try {
        setError(null);
        const lastUpdate =
          updates.length > 0
            ? updates[updates.length - 1].metadata.timestamp
            : undefined;

        const response = await apiClient.getProjectUpdates(
          projectIds,
          lastUpdate
        );

        if (response.success && response.data && Array.isArray(response.data)) {
          setUpdates((prev) => [...prev, ...(response.data || [])]);
          setConnected(true);
        }
      } catch (err) {
        // Check if it's a 404 error (endpoint not implemented)
        if (err instanceof Error && err.message.includes("404")) {
          console.warn(
            "Real-time updates endpoint not available, disabling polling"
          );
          endpointAvailable = false;
          setConnected(false);
          // Clear the interval to stop polling
          if (intervalId) {
            window.clearInterval(intervalId);
          }
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch updates"
        );
        setConnected(false);
      }
    };

    // Only start polling if endpoint is available
    if (endpointAvailable) {
      // Poll every 5 seconds for real-time updates (fallback if SignalR not available)
      intervalId = window.setInterval(pollForUpdates, 5000);

      // Initial fetch
      pollForUpdates();
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [projectIds, enabled]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    connected,
    error,
    clearUpdates,
  };
};

/**
 * Hook for project status workflow management
 */
export const useProjectStatusWorkflow = (projectId: string | null) => {
  const [workflow, setWorkflow] = useState<ProjectStatusWorkflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjectStatusWorkflow(projectId);

      if (response.success && response.data) {
        setWorkflow(response.data);
      } else {
        setError(response.message || "Failed to fetch project workflow");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch; loading/error setState is standard fetch-on-mount, not a derived-state cascade
    fetchWorkflow();
  }, [fetchWorkflow]);

  const updateStatus = useCallback(
    async (statusUpdate: UpdateProjectStatusRequest) => {
      if (!projectId) return null;

      try {
        setError(null);
        const response = await apiClient.updateProjectStatus(
          projectId,
          statusUpdate
        );

        if (response.success) {
          // Refresh workflow after status update
          await fetchWorkflow();
          return response.data;
        } else {
          setError(response.message || "Failed to update project status");
          return null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return null;
      }
    },
    [projectId, fetchWorkflow]
  );

  return {
    workflow,
    loading,
    error,
    updateStatus,
    refetch: fetchWorkflow,
  };
};

/**
 * Hook for bulk project operations
 */
export const useBulkProjectOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performBulkOperation = useCallback(
    async (operation: BulkProjectOperation) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.bulkProjectOperation(operation);

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(response.message || "Failed to perform bulk operation");
          return null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    performBulkOperation,
    loading,
    error,
  };
};

/**
 * Hook for project validation
 */
export const useProjectValidation = () => {
  const [validationResult, setValidationResult] =
    useState<ProjectValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateProject = useCallback(
    async (projectData: Partial<CreateProjectRequest>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.validateProject(projectData);

        if (response.success && response.data) {
          setValidationResult(response.data);
          return response.data;
        } else {
          setError(response.message || "Failed to validate project");
          return null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    validateProject,
    validationResult,
    loading,
    error,
  };
};

/**
 * Enhanced hook for comprehensive project management with real-time updates
 */
export const useEnhancedProjectManagement = () => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<
    ProjectUpdateNotification[]
  >([]);

  // Get real-time updates for selected projects
  const { updates: realTimeUpdates, connected } = useRealTimeProjects(
    selectedProjects,
    true
  ); // Explicitly enable for enhanced project management

  // Bulk operations
  const { performBulkOperation, loading: bulkLoading } =
    useBulkProjectOperations();

  // Project validation
  const { validateProject } = useProjectValidation();

  // Convert real-time updates to notifications
  useEffect(() => {
    const newNotifications = realTimeUpdates.map(
      (update): ProjectUpdateNotification => ({
        type: `PROJECT_${update.updateType.toUpperCase()}` as ProjectUpdateNotification["type"],
        projectId: update.projectId,
        projectName: update.data.projectName || "Unknown Project",
        updatedBy: {
          userId: update.metadata.updatedBy,
          fullName: update.metadata.updatedBy, // Will be enhanced with user service
        },
        timestamp: update.metadata.timestamp,
        changes: update.data,
      })
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect -- accumulates notifications from external real-time updates; behavior-preserving, a useMemo rewrite would change the accumulation semantics
    setNotifications((prev) => [...prev, ...newNotifications]);
  }, [realTimeUpdates]);

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  }, []);

  const selectAllProjects = useCallback((projectIds: string[]) => {
    setSelectedProjects(projectIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProjects([]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const bulkUpdateStatus = useCallback(
    async (status: string, reason: string) => {
      if (selectedProjects.length === 0) return null;

      return performBulkOperation({
        operation: "update_status",
        projectIds: selectedProjects,
        data: { status, reason },
      });
    },
    [selectedProjects, performBulkOperation]
  );

  const bulkAssignManager = useCallback(
    async (managerId: string) => {
      if (selectedProjects.length === 0) return null;

      return performBulkOperation({
        operation: "assign_manager",
        projectIds: selectedProjects,
        data: { projectManagerId: managerId },
      });
    },
    [selectedProjects, performBulkOperation]
  );

  const bulkDelete = useCallback(async () => {
    if (selectedProjects.length === 0) return null;

    return performBulkOperation({
      operation: "delete",
      projectIds: selectedProjects,
      data: {},
    });
  }, [selectedProjects, performBulkOperation]);

  return {
    // Selection management
    selectedProjects,
    selectProject,
    selectAllProjects,
    clearSelection,

    // Real-time features
    notifications,
    clearNotifications,
    connected,

    // Bulk operations
    bulkUpdateStatus,
    bulkAssignManager,
    bulkDelete,
    bulkLoading,

    // Validation
    validateProject,
  };
};
