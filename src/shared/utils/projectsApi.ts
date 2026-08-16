import { apiClient } from "./apiClient";
import { CreateProjectInput, toApiCreateProjectPayload } from "./projectPayload";
import {
  CreateProjectRequest,
  ProjectDto,
  UpdateProjectRequest,
  UpdateProjectStatusRequest,
  ProjectStatusUpdateResponse,
  ProjectSearchRequest,
  ProjectSearchResponse,
  ProjectAnalyticsParams,
  GetProjectsParams,
  ProjectTemplateDto,
  CreateProjectFromTemplateRequest,
  ProjectStatusDto,
  ProjectAnalyticsDto,
  ProjectPerformanceDto,
  ProjectValidationResult,
  ProjectStatusWorkflow,
  BulkProjectOperation,
  BulkProjectOperationResult,
  RealTimeProjectUpdate,
  CreateProjectMilestoneRequest,
  UpdateProjectMilestoneRequest,
  ProjectMilestone,
} from "../types/project";
import { ApiResponse, EnhancedPagedResult } from "../types/api";

/**
 * Comprehensive Solar Projects API Service
 *
 * **⚡ Real-Time Live Updates**: All project operations support real-time data synchronization.
 * **Authentication Required**: All endpoints require JWT authentication
 * **Role Required**: Admin/Manager (full CRUD), User/Viewer (read-only)
 * **📡 Live Updates**: SignalR WebSocket broadcasting for all operations
 */
export class ProjectsApiService {
  private readonly endpoint = "/api/v1/projects";

  // ============================================================================
  // CORE PROJECT CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all projects with advanced filtering, pagination, and sorting
   * GET /api/v1/projects
   */
  async getAllProjects(
    params?: GetProjectsParams
  ): Promise<EnhancedPagedResult<ProjectDto>> {
    try {
      console.log(
        "🔄 [ProjectsApiService.getAllProjects] Starting API call with params:",
        params
      );

      const queryParams = new URLSearchParams();

      if (params?.pageNumber)
        queryParams.append("pageNumber", params.pageNumber.toString());
      if (params?.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params?.fields) queryParams.append("fields", params.fields);
      if (params?.managerId) queryParams.append("managerId", params.managerId);

      const url = queryParams.toString()
        ? `${this.endpoint}?${queryParams}`
        : this.endpoint;

      console.log(
        "📡 [ProjectsApiService.getAllProjects] Making request to:",
        url
      );

      const response = await apiClient.get<
        ApiResponse<EnhancedPagedResult<ProjectDto>>
      >(url);

      console.log("📦 [ProjectsApiService.getAllProjects] Raw API response:", {
        success: response.success,
        data: response.data,
        error: response.error,
        message: response.message,
      });

      const result = response.data || {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        pagination: {
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      console.log("[SUCCESS] ✅ [ProjectsApiService.getAllProjects] Returning result:", {
        itemsCount: result.items?.length || 0,
        totalCount: result.totalCount,
        pageNumber: result.pageNumber,
        pageSize: result.pageSize,
        hasNextPage: result.hasNextPage,
        firstItem: result.items?.[0] || null,
      });

      return result;
    } catch (error) {
      console.error("[ERROR] ❌ [ProjectsApiService.getAllProjects] Error:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        params,
      });
      throw new Error("Failed to fetch projects");
    }
  }

  /**
   * Get project by ID
   * GET /api/v1/projects/{id}
   */
  async getProjectById(id: string): Promise<ProjectDto> {
    try {
      console.log(`[FETCH] 🔍 [ProjectsAPI] Fetching project by ID: ${id}`);
      console.log(`🔗 [ProjectsAPI] Full URL will be: ${this.endpoint}/${id}`);
      console.log(
        `📏 [ProjectsAPI] Project ID length: ${id.length} characters`
      );
      console.log(`🔤 [ProjectsAPI] Project ID format: ${typeof id} - "${id}"`);

      // Validate project ID format
      if (!id || id.trim() === "") {
        throw new Error("Project ID cannot be empty");
      }

      const trimmedId = id.trim();
      console.log(`✂️ [ProjectsAPI] Trimmed ID: "${trimmedId}"`);

      const response = await apiClient.get<ApiResponse<ProjectDto>>(
        `${this.endpoint}/${encodeURIComponent(trimmedId)}`
      );

      console.log(`📦 [ProjectsAPI] API Response:`, {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
        errors: response.errors,
        statusCode: (response as any)?.status,
        fullResponse: response,
      });

      if (!response.success) {
        const errorMsg = response.message || "Failed to fetch project";
        const errors = response.errors?.join(", ") || "";
        const fullError = errors ? `${errorMsg}: ${errors}` : errorMsg;

        console.error(`[ERROR] 🚨 [ProjectsAPI] API Error Details:`, {
          message: errorMsg,
          errors: response.errors,
          projectId: trimmedId,
          endpoint: `${this.endpoint}/${trimmedId}`,
        });

        throw new Error(fullError);
      }

      if (!response.data) {
        throw new Error(
          `Project with ID ${trimmedId} not found - API returned empty data`
        );
      }

      console.log(
        `[SUCCESS] ✅ [ProjectsAPI] Project fetched successfully: ${response.data.projectName}`
      );
      return response.data;
    } catch (error) {
      console.error(`[ERROR] ❌ [ProjectsAPI] Failed to fetch project ${id}:`, error);

      // Enhanced error information
      console.error(`🔧 [ProjectsAPI] Debug info:`, {
        projectId: id,
        trimmedId: id.trim(),
        endpoint: this.endpoint,
        fullUrl: `${this.endpoint}/${id}`,
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw with enhanced context
      throw error instanceof Error
        ? error
        : new Error(`Unknown error fetching project ${id}: ${String(error)}`);
    }
  }

  /**
   * Get current user's projects
   * GET /api/v1/projects/me
   */
  async getMyProjects(
    params?: Omit<GetProjectsParams, "managerId">
  ): Promise<EnhancedPagedResult<ProjectDto>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.pageNumber)
        queryParams.append("pageNumber", params.pageNumber.toString());
      if (params?.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());

      const url = queryParams.toString()
        ? `${this.endpoint}/me?${queryParams}`
        : `${this.endpoint}/me`;
      const response = await apiClient.get<
        ApiResponse<EnhancedPagedResult<ProjectDto>>
      >(url);

      return (
        response.data || {
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          pagination: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }
      );
    } catch (error) {
      console.error("Failed to fetch user projects:", error);
      throw new Error("Failed to fetch user projects");
    }
  }

  /**
   * Get project status
   * GET /api/v1/projects/{id}/status
   */
  async getProjectStatus(id: string): Promise<ProjectStatusDto> {
    try {
      const response = await apiClient.get<ApiResponse<ProjectStatusDto>>(
        `${this.endpoint}/${id}/status`
      );
      if (!response.data) {
        throw new Error("Project status not found");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch project status ${id}:`, error);
      throw new Error(`Failed to fetch project status ${id}`);
    }
  }

  // ============================================================================
  // PROJECT CREATION & MODIFICATION
  // ============================================================================

  /**
   * Create new project (Admin/Manager only)
   * POST /api/v1/projects
   */
  async createProject(projectData: CreateProjectInput): Promise<ProjectDto> {
    try {
      const response = await apiClient.post<ApiResponse<ProjectDto>>(
        this.endpoint,
        toApiCreateProjectPayload(projectData)
      );
      if (!response.data) {
        throw new Error("Failed to create project");
      }
      return response.data;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw new Error("Failed to create project");
    }
  }

  /**
   * Update project (Admin/Manager only)
   * PUT /api/v1/projects/{id}
   */
  async updateProject(
    id: string,
    projectData: UpdateProjectRequest
  ): Promise<ProjectDto> {
    try {
      const response = await apiClient.put<ApiResponse<ProjectDto>>(
        `${this.endpoint}/${id}`,
        projectData
      );
      if (!response.data) {
        throw new Error("Failed to update project");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to update project ${id}:`, error);
      throw new Error(`Failed to update project ${id}`);
    }
  }

  /**
   * Partial update project (Admin/Manager only)
   * PATCH /api/v1/projects/{id}
   */
  async patchProject(
    id: string,
    projectData: Partial<UpdateProjectRequest>
  ): Promise<ProjectDto> {
    try {
      const response = await apiClient.patch<ApiResponse<ProjectDto>>(
        `${this.endpoint}/${id}`,
        projectData
      );
      if (!response.data) {
        throw new Error("Failed to patch project");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to patch project ${id}:`, error);
      throw new Error(`Failed to patch project ${id}`);
    }
  }

  /**
   * Delete project (Admin only)
   * DELETE /api/v1/projects/{id}
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      throw new Error(`Failed to delete project ${id}`);
    }
  }

  // ============================================================================
  // PROJECT STATUS & WORKFLOW MANAGEMENT
  // ============================================================================

  /**
   * Update project status with workflow validation
   * PATCH /api/v1/projects/{id}/status
   */
  async updateProjectStatus(
    id: string,
    statusData: UpdateProjectStatusRequest
  ): Promise<ProjectStatusUpdateResponse> {
    try {
      const response = await apiClient.patch<
        ApiResponse<ProjectStatusUpdateResponse>
      >(`${this.endpoint}/${id}/status`, statusData);
      if (!response.data) {
        throw new Error("Failed to update project status");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to update status for project ${id}:`, error);
      throw new Error(`Failed to update status for project ${id}`);
    }
  }

  /**
   * Get project status workflow
   * GET /api/v1/projects/{id}/workflow
   */
  async getProjectWorkflow(id: string): Promise<ProjectStatusWorkflow> {
    try {
      const response = await apiClient.get<ApiResponse<ProjectStatusWorkflow>>(
        `${this.endpoint}/${id}/workflow`
      );
      if (!response.data) {
        throw new Error("Project workflow not found");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch project workflow ${id}:`, error);
      throw new Error(`Failed to fetch project workflow ${id}`);
    }
  }

  // ============================================================================
  // PROJECT ANALYTICS & PERFORMANCE
  // ============================================================================

  /**
   * Get project analytics
   * GET /api/v1/projects/analytics
   */
  async getProjectAnalytics(
    params?: ProjectAnalyticsParams
  ): Promise<ProjectAnalyticsDto> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.timeframe) queryParams.append("timeframe", params.timeframe);
      if (params?.groupBy) queryParams.append("groupBy", params.groupBy);
      if (params?.includeFinancial)
        queryParams.append(
          "includeFinancial",
          params.includeFinancial.toString()
        );
      if (params?.includePerformance)
        queryParams.append(
          "includePerformance",
          params.includePerformance.toString()
        );

      const url = queryParams.toString()
        ? `${this.endpoint}/analytics?${queryParams}`
        : `${this.endpoint}/analytics`;
      const response = await apiClient.get<ApiResponse<ProjectAnalyticsDto>>(
        url
      );

      if (!response.data) {
        throw new Error("Analytics data not available");
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch project analytics:", error);
      throw new Error("Failed to fetch project analytics");
    }
  }

  /**
   * Get project performance metrics
   * GET /api/v1/projects/{id}/performance
   */
  async getProjectPerformance(id: string): Promise<ProjectPerformanceDto> {
    try {
      const response = await apiClient.get<ApiResponse<ProjectPerformanceDto>>(
        `${this.endpoint}/${id}/performance`
      );
      if (!response.data) {
        throw new Error("Performance data not available");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch project performance ${id}:`, error);
      throw new Error(`Failed to fetch project performance ${id}`);
    }
  }

  /**
   * Get project milestones
   * GET /api/v1/projects/{id}/milestones
   */
  async getProjectMilestones(id: string): Promise<ProjectMilestone[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProjectMilestone[]>>(
        `${this.endpoint}/${id}/milestones`
      );
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch project milestones ${id}:`, error);
      throw new Error(`Failed to fetch project milestones ${id}`);
    }
  }

  /**
   * Add milestone to project
   * POST /api/v1/projects/{id}/milestones
   */
  async addMilestone(
    id: string,
    milestone: CreateProjectMilestoneRequest
  ): Promise<ProjectMilestone> {
    try {
      const response = await apiClient.post<ApiResponse<ProjectMilestone>>(
        `${this.endpoint}/${id}/milestones`,
        milestone
      );
      if (!response.data) {
        throw new Error("Failed to add milestone");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to add milestone to project ${id}:`, error);
      throw new Error(`Failed to add milestone to project ${id}`);
    }
  }

  /**
   * Update milestone
   * PUT /api/v1/projects/{id}/milestones/{milestoneId}
   */
  async updateMilestone(
    id: string,
    milestoneId: string,
    milestone: UpdateProjectMilestoneRequest
  ): Promise<ProjectMilestone> {
    try {
      const response = await apiClient.put<ApiResponse<ProjectMilestone>>(
        `${this.endpoint}/${id}/milestones/${milestoneId}`,
        milestone
      );
      if (!response.data) {
        throw new Error("Failed to update milestone");
      }
      return response.data;
    } catch (error) {
      console.error(`Failed to update milestone ${milestoneId}:`, error);
      throw new Error(`Failed to update milestone ${milestoneId}`);
    }
  }

  /**
   * Delete milestone
   * DELETE /api/v1/projects/{id}/milestones/{milestoneId}
   */
  async deleteMilestone(id: string, milestoneId: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(
        `${this.endpoint}/${id}/milestones/${milestoneId}`
      );
    } catch (error) {
      console.error(`Failed to delete milestone ${milestoneId}:`, error);
      throw new Error(`Failed to delete milestone ${milestoneId}`);
    }
  }

  // ============================================================================
  // PROJECT TEMPLATES
  // ============================================================================

  /**
   * Get project templates
   * GET /api/v1/projects/templates
   */
  async getProjectTemplates(): Promise<ProjectTemplateDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProjectTemplateDto[]>>(
        `${this.endpoint}/templates`
      );
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch project templates:", error);
      throw new Error("Failed to fetch project templates");
    }
  }

  /**
   * Create project from template
   * POST /api/v1/projects/from-template/{templateId}
   */
  async createProjectFromTemplate(
    templateId: string,
    projectData: CreateProjectFromTemplateRequest
  ): Promise<ProjectDto> {
    try {
      const response = await apiClient.post<ApiResponse<ProjectDto>>(
        `${this.endpoint}/from-template/${templateId}`,
        projectData
      );
      if (!response.data) {
        throw new Error("Failed to create project from template");
      }
      return response.data;
    } catch (error) {
      console.error(
        `Failed to create project from template ${templateId}:`,
        error
      );
      throw new Error(`Failed to create project from template ${templateId}`);
    }
  }

  // ============================================================================
  // ADVANCED SEARCH & FILTERING
  // ============================================================================

  /**
   * Advanced project search
   * GET /api/v1/projects/search
   */
  async searchProjects(
    searchParams: ProjectSearchRequest
  ): Promise<ProjectSearchResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (searchParams.q) queryParams.append("q", searchParams.q);
      if (searchParams.filters)
        queryParams.append("filters", JSON.stringify(searchParams.filters));
      if (searchParams.coordinates)
        queryParams.append("coordinates", searchParams.coordinates);
      if (searchParams.dateRange)
        queryParams.append("dateRange", searchParams.dateRange);
      if (searchParams.facets)
        queryParams.append("facets", searchParams.facets.toString());

      const url = `${this.endpoint}/search?${queryParams}`;
      const response = await apiClient.get<ApiResponse<ProjectSearchResponse>>(
        url
      );

      if (!response.data) {
        throw new Error("Search failed");
      }
      return response.data;
    } catch (error) {
      console.error("Failed to search projects:", error);
      throw new Error("Failed to search projects");
    }
  }

  // ============================================================================
  // BULK OPERATIONS (Admin)
  // ============================================================================

  /**
   * Bulk project operations
   * POST /api/v1/projects/bulk
   */
  async bulkOperations(
    operation: BulkProjectOperation
  ): Promise<BulkProjectOperationResult> {
    try {
      const response = await apiClient.post<
        ApiResponse<BulkProjectOperationResult>
      >(`${this.endpoint}/bulk`, operation);
      if (!response.data) {
        throw new Error("Bulk operation failed");
      }
      return response.data;
    } catch (error) {
      console.error("Failed to execute bulk operation:", error);
      throw new Error("Failed to execute bulk operation");
    }
  }

  // ============================================================================
  // PROJECT VALIDATION
  // ============================================================================

  /**
   * Validate project data
   * POST /api/v1/projects/validate
   */
  async validateProject(
    projectData: CreateProjectRequest | UpdateProjectRequest
  ): Promise<ProjectValidationResult> {
    try {
      const response = await apiClient.post<
        ApiResponse<ProjectValidationResult>
      >(`${this.endpoint}/validate`, projectData);
      if (!response.data) {
        throw new Error("Validation failed");
      }
      return response.data;
    } catch (error) {
      console.error("Failed to validate project:", error);
      throw new Error("Failed to validate project");
    }
  }

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  /**
   * Subscribe to real-time project updates
   * WebSocket connection for live updates
   */
  async subscribeToProjectUpdates(projectId?: string): Promise<void> {
    try {
      // This would integrate with SignalR or WebSocket connection
      const endpoint = projectId
        ? `${this.endpoint}/${projectId}/subscribe`
        : `${this.endpoint}/subscribe`;

      await apiClient.post<ApiResponse<void>>(endpoint, {});
    } catch (error) {
      console.error("Failed to subscribe to project updates:", error);
      throw new Error("Failed to subscribe to project updates");
    }
  }

  /**
   * Unsubscribe from real-time project updates
   */
  async unsubscribeFromProjectUpdates(projectId?: string): Promise<void> {
    try {
      const endpoint = projectId
        ? `${this.endpoint}/${projectId}/unsubscribe`
        : `${this.endpoint}/unsubscribe`;

      await apiClient.post<ApiResponse<void>>(endpoint, {});
    } catch (error) {
      console.error("Failed to unsubscribe from project updates:", error);
      throw new Error("Failed to unsubscribe from project updates");
    }
  }

  // ============================================================================
  // BACKWARD COMPATIBILITY METHODS
  // ============================================================================

  /**
   * Get simple list of projects (backward compatibility)
   */
  async getProjectsList(): Promise<ProjectDto[]> {
    try {
      const response = await this.getAllProjects({ pageSize: 1000 });
      return response.items || [];
    } catch (error) {
      console.error("Failed to fetch projects list:", error);
      throw new Error("Failed to fetch projects list");
    }
  }

  /**
   * Get projects by status (backward compatibility)
   */
  async getProjectsByStatus(status: string): Promise<ProjectDto[]> {
    try {
      const response = await this.getAllProjects({ status, pageSize: 1000 });
      return response.items || [];
    } catch (error) {
      console.error(`Failed to fetch projects with status ${status}:`, error);
      throw new Error(`Failed to fetch projects with status ${status}`);
    }
  }

  /**
   * Get construction projects (backward compatibility)
   */
  async getConstructionProjects(): Promise<ProjectDto[]> {
    return this.getProjectsByStatus("InProgress");
  }

  /**
   * Update project progress (backward compatibility)
   * Note: There's no direct progress field, so we'll use a status update instead
   */
  async updateProjectProgress(
    id: string,
    progress: number
  ): Promise<ProjectDto> {
    // Map progress to status for backward compatibility
    const status =
      progress >= 100 ? "Completed" : progress > 0 ? "InProgress" : "Planning";
    return this.patchProject(id, { status });
  }

  /**
   * Get project statistics (backward compatibility)
   */
  async getProjectStats(): Promise<{
    totalProjects: number;
    totalBudget: number;
    totalSpent: number;
    totalCapacity: number;
    budgetUtilization: number;
    statusDistribution: Record<string, number>;
  }> {
    try {
      const analytics = await this.getProjectAnalytics({
        includeFinancial: true,
        includePerformance: true,
      });

      // Use available fields and provide fallback values for fields not in the API
      return {
        totalProjects: analytics.summary?.totalProjects || 0,
        totalBudget: 0, // Not available in current API
        totalSpent: 0, // Not available in current API
        totalCapacity: analytics.summary?.totalCapacity || 0,
        budgetUtilization: analytics.performanceMetrics?.budgetVariance || 0,
        statusDistribution: analytics.statusBreakdown || {},
      };
    } catch (error) {
      console.error("Failed to fetch project statistics:", error);
      throw new Error("Failed to fetch project statistics");
    }
  }
}

// Create and export singleton instance
export const projectsApi = new ProjectsApiService();
