import { useState, useEffect, useCallback } from "react";
import { ProjectDto, CreateProjectRequest } from "../types/project";
import { projectsApi } from "../utils/projectsApi";

export interface ProjectStats {
  totalProjects: number;
  totalBudget: number;
  totalSpent: number;
  totalCapacity: number;
  budgetUtilization?: number;
  statusDistribution?: Record<string, number>;
  activeProjects?: number;
}

export interface UseProjectsReturn {
  // Data
  projects: ProjectDto[];
  stats: ProjectStats | null;

  // Loading states
  loading: boolean;
  statsLoading: boolean;

  // Error states
  error: string | null;
  statsError: string | null;

  // Actions
  createProject: (projectData: CreateProjectRequest) => Promise<boolean>;
  updateProject: (
    id: string,
    projectData: Partial<ProjectDto>
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  updateProjectProgress: (id: string, progress: number) => Promise<boolean>;

  // Refresh methods
  refreshProjects: () => Promise<void>;
  refreshStats: () => Promise<void>;

  // Utility methods
  getConstructionProjects: () => ProjectDto[];
  getProjectStats: () => ProjectStats | null;
  getProjectsByStatus: (status: string) => ProjectDto[];
}

export const useProjects = (): UseProjectsReturn => {
  // Log hook initialization
  console.log("[useProjects] Hook initialized");

  // State
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch all projects from API
  const fetchProjects = useCallback(async () => {
    try {
      console.log("[Get All Projects] Starting API call...");
      setLoading(true);
      setError(null);

      const fetchedProjects = await projectsApi.getAllProjects({ pageSize: 1000 });

      console.log("[Get All Projects] API Response:", {
        success: !!fetchedProjects,
        totalCount: fetchedProjects?.totalCount || 0,
        itemsLength: fetchedProjects?.items?.length || 0,
        pageNumber: fetchedProjects?.pageNumber,
        pageSize: fetchedProjects?.pageSize,
        hasNextPage: fetchedProjects?.hasNextPage,
        fullResponse: fetchedProjects,
      });

      const projects = fetchedProjects.items || [];
      console.log("[Get All Projects] Setting projects:", projects);

      setProjects(projects);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch projects";
      console.error("[Get All Projects] Error:", {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("[Get All Projects] Fetch complete");
    }
  }, []);

  // Fetch project statistics from API
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const fetchedStats = await projectsApi.getProjectStats();

      // Calculate additional statistics
      const budgetUtilization =
        fetchedStats.totalBudget > 0
          ? (fetchedStats.totalSpent / fetchedStats.totalBudget) * 100
          : 0;

      const activeProjects = Object.values(
        fetchedStats.statusDistribution || {}
      )
        .filter((_, index) => {
          const statuses = Object.keys(fetchedStats.statusDistribution || {});
          return statuses[index] !== "Completed";
        })
        .reduce((sum, count) => sum + count, 0);

      setStats({
        ...fetchedStats,
        budgetUtilization,
        activeProjects,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch project statistics";
      setStatsError(errorMessage);
      console.error("Failed to fetch project statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Create a new project
  const createProject = useCallback(
    async (projectData: CreateProjectRequest): Promise<boolean> => {
      try {
        const newProject = await projectsApi.createProject(projectData);
        setProjects((prev) => [...prev, newProject]);

        // Refresh stats after creating a project
        fetchStats();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create project";
        setError(errorMessage);
        console.error("Failed to create project:", err);
        return false;
      }
    },
    [fetchStats]
  );

  // Update an existing project
  const updateProject = useCallback(
    async (id: string, projectData: Partial<ProjectDto>): Promise<boolean> => {
      try {
        // Convert ProjectDto fields to UpdateProjectRequest fields
        const updateData: any = {};
        if (projectData.projectName !== undefined)
          updateData.projectName = projectData.projectName;
        if (projectData.address !== undefined)
          updateData.address = projectData.address;
        if (projectData.clientInfo !== undefined)
          updateData.clientInfo = projectData.clientInfo;
        if (projectData.status !== undefined)
          updateData.status = projectData.status;
        if (projectData.startDate !== undefined)
          updateData.startDate = projectData.startDate;
        if (projectData.estimatedEndDate !== undefined)
          updateData.estimatedEndDate = projectData.estimatedEndDate;
        if (projectData.actualEndDate !== undefined)
          updateData.actualEndDate = projectData.actualEndDate;

        const updatedProject = await projectsApi.patchProject(id, updateData);
        setProjects((prev) =>
          prev.map((project) =>
            project.projectId === id ? updatedProject : project
          )
        );

        // Refresh stats after updating a project
        fetchStats();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update project";
        setError(errorMessage);
        console.error("Failed to update project:", err);
        return false;
      }
    },
    [fetchStats]
  );

  // Delete a project
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await projectsApi.deleteProject(id);
        setProjects((prev) =>
          prev.filter((project) => project.projectId !== id)
        );

        // Refresh stats after deleting a project
        fetchStats();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete project";
        setError(errorMessage);
        console.error("Failed to delete project:", err);
        return false;
      }
    },
    [fetchStats]
  );

  // Update project progress
  const updateProjectProgress = useCallback(
    async (id: string, progress: number): Promise<boolean> => {
      try {
        const updatedProject = await projectsApi.updateProjectProgress(
          id,
          progress
        );
        setProjects((prev) =>
          prev.map((project) =>
            project.projectId === id ? updatedProject : project
          )
        );

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update project progress";
        setError(errorMessage);
        console.error("Failed to update project progress:", err);
        return false;
      }
    },
    []
  );

  // Refresh projects
  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Get construction projects (cached from current projects)
  const getConstructionProjects = useCallback((): ProjectDto[] => {
    return projects.filter((project) => project.status === "InProgress");
  }, [projects]);

  // Get current stats
  const getProjectStats = useCallback((): ProjectStats | null => {
    return stats;
  }, [stats]);

  // Get projects by status
  const getProjectsByStatus = useCallback(
    (status: string): ProjectDto[] => {
      return projects.filter((project) => project.status === status);
    },
    [projects]
  );

  // Initial data fetch
  useEffect(() => {
    console.log(
      "🔄 [useProjects] Initial useEffect triggered - fetching projects and stats"
    );
    fetchProjects();
    fetchStats();
  }, [fetchProjects, fetchStats]);

  return {
    // Data
    projects,
    stats,

    // Loading states
    loading,
    statsLoading,

    // Error states
    error,
    statsError,

    // Actions
    createProject,
    updateProject,
    deleteProject,
    updateProjectProgress,

    // Refresh methods
    refreshProjects,
    refreshStats,

    // Utility methods
    getConstructionProjects,
    getProjectStats,
    getProjectsByStatus,
  };
};
