import { ApiClient } from "../../utils/apiClient";
import { ApiResponse, EnhancedPagedResult } from "../../types/api";
import {
  ProjectDto,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatusDto,
  ProjectAnalyticsDto,
  ProjectPerformanceDto,
  ProjectTemplateDto,
  CreateProjectFromTemplateRequest,
  UpdateProjectStatusRequest,
  ProjectStatusUpdateResponse,
  ProjectSearchRequest,
  ProjectSearchResponse,
  GetProjectsParams,
  ProjectAnalyticsParams,
  ProjectValidationResult,
  ProjectStatusWorkflow,
  BulkProjectOperation,
  BulkProjectOperationResult,
  RealTimeProjectUpdate,
  CreateProjectMilestoneRequest,
  UpdateProjectMilestoneRequest,
  ProjectMilestone,
} from "../../types/project";

/**
 * Projects API module
 * Handles all project management endpoints
 */
export class ProjectsApi {
  constructor(private apiClient: ApiClient) { }

  /**
   * Get all projects with enhanced filtering and pagination
   */
  async getProjects(
    params?: GetProjectsParams
  ): Promise<ApiResponse<EnhancedPagedResult<ProjectDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<ProjectDto>>>(
      `/api/v1/projects${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<ApiResponse<ProjectDto>> {
    return this.apiClient.get<ApiResponse<ProjectDto>>(
      `/api/v1/Projects/${id}`
    );
  }

  /**
   * Create new project
   */
  async createProject(
    project: CreateProjectRequest
  ): Promise<ApiResponse<ProjectDto>> {
    return this.apiClient.post<ApiResponse<ProjectDto>>(
      "/api/v1/Projects",
      project
    );
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    project: UpdateProjectRequest
  ): Promise<ApiResponse<ProjectDto>> {
    return this.apiClient.put<ApiResponse<ProjectDto>>(
      `/api/v1/Projects/${id}`,
      project
    );
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/Projects/${id}`
    );
  }

  /**
   * Get projects assigned to current user
   */
  async getMyProjects(params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ApiResponse<EnhancedPagedResult<ProjectDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<ProjectDto>>>(
      `/api/v1/Projects/me${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get project status
   */
  async getProjectStatus(id: string): Promise<ApiResponse<ProjectStatusDto>> {
    return this.apiClient.get<ApiResponse<ProjectStatusDto>>(
      `/api/v1/projects/${id}/status`
    );
  }

  /**
   * Partially update project (PATCH - partial update)
   */
  async patchProject(
    id: string,
    updates: Partial<UpdateProjectRequest>
  ): Promise<ApiResponse<ProjectDto>> {
    return this.apiClient.patch<ApiResponse<ProjectDto>>(
      `/api/v1/projects/${id}`,
      updates
    );
  }

  /**
   * Update project status with workflow validation
   */
  async updateProjectStatus(
    id: string,
    statusUpdate: UpdateProjectStatusRequest
  ): Promise<ApiResponse<ProjectStatusUpdateResponse>> {
    return this.apiClient.patch<ApiResponse<ProjectStatusUpdateResponse>>(
      `/api/v1/projects/${id}/status`,
      statusUpdate
    );
  }

  /**
   * Get project analytics and performance metrics
   */
  async getProjectAnalytics(
    params?: ProjectAnalyticsParams
  ): Promise<ApiResponse<ProjectAnalyticsDto>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<ProjectAnalyticsDto>>(
      `/api/v1/projects/analytics${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get detailed performance metrics for a specific project
   */
  async getProjectPerformance(
    id: string
  ): Promise<ApiResponse<ProjectPerformanceDto>> {
    return this.apiClient.get<ApiResponse<ProjectPerformanceDto>>(
      `/api/v1/projects/${id}/performance`
    );
  }

  /**
   * Get project milestones
   */
  async getProjectMilestones(
    id: string
  ): Promise<ApiResponse<ProjectMilestone[]>> {
    return this.apiClient.get<ApiResponse<ProjectMilestone[]>>(
      `/api/v1/projects/${id}/milestones`
    );
  }

  /**
   * Add milestone to project
   */
  async addMilestone(
    id: string,
    milestone: CreateProjectMilestoneRequest
  ): Promise<ApiResponse<ProjectMilestone>> {
    return this.apiClient.post<ApiResponse<ProjectMilestone>>(
      `/api/v1/projects/${id}/milestones`,
      milestone
    );
  }

  /**
   * Update milestone
   */
  async updateMilestone(
    id: string,
    milestoneId: string,
    milestone: UpdateProjectMilestoneRequest
  ): Promise<ApiResponse<ProjectMilestone>> {
    return this.apiClient.put<ApiResponse<ProjectMilestone>>(
      `/api/v1/projects/${id}/milestones/${milestoneId}`,
      milestone
    );
  }

  /**
   * Delete milestone
   */
  async deleteMilestone(
    id: string,
    milestoneId: string
  ): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/projects/${id}/milestones/${milestoneId}`
    );
  }

  /**
   * Get available project templates
   */
  async getProjectTemplates(): Promise<
    ApiResponse<{ templates: ProjectTemplateDto[] }>
  > {
    return this.apiClient.get<ApiResponse<{ templates: ProjectTemplateDto[] }>>(
      "/api/v1/projects/templates"
    );
  }

  /**
   * Create project from template
   */
  async createProjectFromTemplate(
    templateId: string,
    projectData: CreateProjectFromTemplateRequest
  ): Promise<ApiResponse<ProjectDto>> {
    return this.apiClient.post<ApiResponse<ProjectDto>>(
      `/api/v1/projects/from-template/${templateId}`,
      projectData
    );
  }

  /**
   * Advanced project search with facets and full-text search
   */
  async searchProjects(
    searchRequest: ProjectSearchRequest
  ): Promise<ApiResponse<ProjectSearchResponse>> {
    const queryString = new URLSearchParams(searchRequest as any).toString();
    return this.apiClient.get<ApiResponse<ProjectSearchResponse>>(
      `/api/v1/projects/search${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Validate project data before submission
   */
  async validateProject(
    projectData: Partial<CreateProjectRequest>
  ): Promise<ApiResponse<ProjectValidationResult>> {
    return this.apiClient.post<ApiResponse<ProjectValidationResult>>(
      "/api/v1/projects/validate",
      projectData
    );
  }

  /**
   * Get project status workflow information
   */
  async getProjectStatusWorkflow(
    id: string
  ): Promise<ApiResponse<ProjectStatusWorkflow>> {
    return this.apiClient.get<ApiResponse<ProjectStatusWorkflow>>(
      `/api/v1/projects/${id}/status-workflow`
    );
  }

  /**
   * Bulk operations on multiple projects
   */
  async bulkProjectOperation(
    operation: BulkProjectOperation
  ): Promise<ApiResponse<BulkProjectOperationResult>> {
    return this.apiClient.post<ApiResponse<BulkProjectOperationResult>>(
      "/api/v1/projects/bulk",
      operation
    );
  }

  /**
   * Get real-time project updates (for SignalR/WebSocket setup)
   */
  async getProjectUpdates(
    projectIds?: string[],
    since?: string
  ): Promise<ApiResponse<RealTimeProjectUpdate[]>> {
    const params = new URLSearchParams();
    if (projectIds) {
      projectIds.forEach((id) => params.append("projectIds", id));
    }
    if (since) {
      params.append("since", since);
    }
    return this.apiClient.get<ApiResponse<RealTimeProjectUpdate[]>>(
      `/api/v1/projects/updates${params.toString() ? `?${params.toString()}` : ""
      }`
    );
  }
}
