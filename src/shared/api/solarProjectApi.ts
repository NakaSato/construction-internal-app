import { ApiClient } from "../utils/apiClient";
import {
  CreateProjectInput,
  toApiCreateProjectPayload,
} from "../utils/projectPayload";
import {
  ApiResponse,
  CalendarEventDto,
  CreateCalendarEventDto,
  EnhancedPagedResult,
  TaskDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  MasterPlanDto,
  CreateMasterPlanRequest,
  ProjectPhaseDto,
  ProjectMilestoneDto,
  ResourceDto,
  WorkRequestDto,
  NotificationDto,
  DocumentDto,
  ImageMetadataDto,
  DashboardOverviewDto,
  WeeklyReportDto,
} from "../types/api";
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
  // Daily Reports types
  DailyReportDto,
  CreateDailyReportRequest,
  UpdateDailyReportRequest,
  GetDailyReportsParams,
  DailyReportAnalytics,
  DailyReportValidationResult,
  DailyReportTemplate,
  DailyReportExportRequest,
  BulkApprovalRequest,
  BulkRejectionRequest,
  BulkOperationResult,
  DailyReportUpdateNotification,
  DailyReportApprovalStatus,
} from "../types/project";
import { WeeklySummaryDto } from "../types/reports";
import { User } from "../types/auth";

/**
 * Main API service class that provides methods for all API endpoints
 * Based on your Solar Project Management API Swagger documentation
 */
export class SolarProjectApi {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.apiClient.setAuthToken(token);
  }

  // Clear authentication token
  clearAuthToken(): void {
    this.apiClient.clearAuthToken();
  }

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================

  /**
   * Login user
   */
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<ApiResponse<any>> {
    return this.apiClient.post<ApiResponse<any>>(
      "/api/v1/Auth/login",
      credentials
    );
  }

  /**
   * Register new user
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<ApiResponse<any>> {
    return this.apiClient.post<ApiResponse<any>>(
      "/api/v1/Auth/register",
      userData
    );
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<string>> {
    return this.apiClient.post<ApiResponse<string>>("/api/v1/Auth/refresh", {
      refreshToken,
    });
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<boolean>> {
    return this.apiClient.post<ApiResponse<boolean>>("/api/v1/Auth/logout");
  }

  // ============================================================================
  // PROJECT ENDPOINTS
  // ============================================================================

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
    project: CreateProjectInput
  ): Promise<ApiResponse<ProjectDto>> {
    return this.apiClient.post<ApiResponse<ProjectDto>>(
      "/api/v1/Projects",
      toApiCreateProjectPayload(project)
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
      `/api/v1/projects/updates${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
  }

  // ============================================================================
  // DAILY REPORTS ENDPOINTS
  // ============================================================================

  /**
   * Get daily reports with filtering and pagination
   */
  async getDailyReports(params?: {
    ProjectId?: string;
    ReporterId?: string;
    Status?: string;
    ReportDateAfter?: string;
    ReportDateBefore?: string;
    WeatherCondition?: string;
    CreatedAfter?: string;
    CreatedBefore?: string;
    UpdatedAfter?: string;
    UpdatedBefore?: string;
    HasWorkProgress?: boolean;
    HasIssues?: boolean;
    PageNumber?: number;
    PageSize?: number;
    SortBy?: string;
    SortOrder?: string;
    Search?: string;
    Fields?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<DailyReportDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<DailyReportDto>>>(
      `/api/v1/daily-reports${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get daily report by ID
   */
  async getDailyReport(id: string): Promise<ApiResponse<DailyReportDto>> {
    return this.apiClient.get<ApiResponse<DailyReportDto>>(
      `/api/v1/daily-reports/${id}`
    );
  }

  /**
   * Create new daily report
   */
  async createDailyReport(
    report: CreateDailyReportRequest
  ): Promise<ApiResponse<DailyReportDto>> {
    return this.apiClient.post<ApiResponse<DailyReportDto>>(
      "/api/v1/daily-reports",
      report
    );
  }

  /**
   * Update daily report
   */
  async updateDailyReport(
    id: string,
    report: Partial<CreateDailyReportRequest>
  ): Promise<ApiResponse<DailyReportDto>> {
    return this.apiClient.put<ApiResponse<DailyReportDto>>(
      `/api/v1/daily-reports/${id}`,
      report
    );
  }

  /**
   * Delete daily report
   */
  async deleteDailyReport(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/daily-reports/${id}`
    );
  }

  /**
   * Approve daily report
   */
  async approveDailyReport(id: string): Promise<ApiResponse<DailyReportDto>> {
    return this.apiClient.post<ApiResponse<DailyReportDto>>(
      `/api/v1/daily-reports/${id}/approve`
    );
  }

  /**
   * Get daily reports for specific project
   */
  async getDailyReportsByProject(
    projectId: string,
    params?: {
      StartDate?: string;
      EndDate?: string;
      ExactDate?: string;
      ApprovalStatuses?: string[];
      HasCriticalIssues?: boolean;
      RequiresManagerAttention?: boolean;
      PageNumber?: number;
      PageSize?: number;
    }
  ): Promise<ApiResponse<EnhancedPagedResult<DailyReportDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<DailyReportDto>>>(
      `/api/v1/daily-reports/projects/${projectId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  }

  /**
   * Get pending approval reports
   */
  async getPendingApprovalReports(params?: {
    projectId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ApiResponse<EnhancedPagedResult<DailyReportDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<DailyReportDto>>>(
      `/api/v1/daily-reports/pending-approval${
        queryString ? `?${queryString}` : ""
      }`
    );
  }

  // ============================================================================
  // ENHANCED DAILY REPORTS ENDPOINTS
  // ============================================================================

  /**
   * Reject daily report
   */
  async rejectDailyReport(
    id: string,
    rejectionReason: string
  ): Promise<ApiResponse<DailyReportDto>> {
    return this.apiClient.post<ApiResponse<DailyReportDto>>(
      `/api/v1/daily-reports/${id}/reject`,
      { rejectionReason }
    );
  }

  /**
   * Submit daily report for approval
   */
  async submitDailyReportForApproval(
    id: string
  ): Promise<ApiResponse<DailyReportDto>> {
    return this.apiClient.post<ApiResponse<DailyReportDto>>(
      `/api/v1/daily-reports/${id}/submit`
    );
  }

  /**
   * Get daily report analytics
   */
  async getDailyReportAnalytics(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<DailyReportAnalytics>> {
    return this.apiClient.get<ApiResponse<DailyReportAnalytics>>(
      `/api/v1/daily-reports/analytics/${projectId}?startDate=${startDate}&endDate=${endDate}`
    );
  }

  /**
   * Validate daily report
   */
  async validateDailyReport(
    reportData: CreateDailyReportRequest
  ): Promise<ApiResponse<DailyReportValidationResult>> {
    return this.apiClient.post<ApiResponse<DailyReportValidationResult>>(
      "/api/v1/daily-reports/validate",
      reportData
    );
  }

  /**
   * Bulk approve daily reports
   */
  async bulkApproveDailyReports(
    request: BulkApprovalRequest
  ): Promise<ApiResponse<BulkOperationResult>> {
    return this.apiClient.post<ApiResponse<BulkOperationResult>>(
      "/api/v1/daily-reports/bulk-approve",
      request
    );
  }

  /**
   * Bulk reject daily reports
   */
  async bulkRejectDailyReports(
    request: BulkRejectionRequest
  ): Promise<ApiResponse<BulkOperationResult>> {
    return this.apiClient.post<ApiResponse<BulkOperationResult>>(
      "/api/v1/daily-reports/bulk-reject",
      request
    );
  }

  /**
   * Export daily reports
   */
  async exportDailyReports(
    request: DailyReportExportRequest
  ): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> {
    return this.apiClient.post<
      ApiResponse<{ downloadUrl: string; fileName: string }>
    >("/api/v1/daily-reports/export", request);
  }

  /**
   * Get daily report templates
   */
  async getDailyReportTemplates(
    projectId?: string
  ): Promise<ApiResponse<DailyReportTemplate[]>> {
    const params = projectId ? `?projectId=${projectId}` : "";
    return this.apiClient.get<ApiResponse<DailyReportTemplate[]>>(
      `/api/v1/daily-reports/templates${params}`
    );
  }

  /**
   * Create daily report template
   */
  async createDailyReportTemplate(
    templateData: Partial<DailyReportTemplate>
  ): Promise<ApiResponse<DailyReportTemplate>> {
    return this.apiClient.post<ApiResponse<DailyReportTemplate>>(
      "/api/v1/daily-reports/templates",
      templateData
    );
  }

  /**
   * Update daily report template
   */
  async updateDailyReportTemplate(
    id: string,
    templateData: Partial<DailyReportTemplate>
  ): Promise<ApiResponse<DailyReportTemplate>> {
    return this.apiClient.put<ApiResponse<DailyReportTemplate>>(
      `/api/v1/daily-reports/templates/${id}`,
      templateData
    );
  }

  /**
   * Delete daily report template
   */
  async deleteDailyReportTemplate(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/daily-reports/templates/${id}`
    );
  }

  /**
   * Get daily reports for real-time updates
   */
  async getDailyReportUpdates(
    projectId: string,
    lastUpdated?: string
  ): Promise<ApiResponse<DailyReportUpdateNotification[]>> {
    const params = lastUpdated ? `?lastUpdated=${lastUpdated}` : "";
    return this.apiClient.get<ApiResponse<DailyReportUpdateNotification[]>>(
      `/api/v1/daily-reports/updates/${projectId}${params}`
    );
  }

  /**
   * Get daily reports with enhanced search
   */
  async searchDailyReports(
    params: GetDailyReportsParams
  ): Promise<ApiResponse<EnhancedPagedResult<DailyReportDto>>> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<DailyReportDto>>>(
      `/api/v1/daily-reports/search?${queryString}`
    );
  }

  // ============================================================================
  // WEEKLY REPORTS ENDPOINTS
  // ============================================================================

  /**
   * Get weekly reports for project
   */
  async getWeeklyReports(
    projectId: string,
    params?: {
      Status?: string;
      WeekStartAfter?: string;
      WeekStartBefore?: string;
      PageNumber?: number;
      PageSize?: number;
    }
  ): Promise<ApiResponse<EnhancedPagedResult<WeeklyReportDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<
      ApiResponse<EnhancedPagedResult<WeeklyReportDto>>
    >(
      `/api/v1/projects/${projectId}/weekly-reports${
        queryString ? `?${queryString}` : ""
      }`
    );
  }

  /**
   * Create weekly report
   */
  async createWeeklyReport(
    projectId: string,
    report: any
  ): Promise<ApiResponse<WeeklyReportDto>> {
    return this.apiClient.post<ApiResponse<WeeklyReportDto>>(
      `/api/v1/projects/${projectId}/weekly-reports`,
      report
    );
  }

  /**
   * Get weekly report by ID
   */
  async getWeeklyReport(
    reportId: string
  ): Promise<ApiResponse<WeeklyReportDto>> {
    return this.apiClient.get<ApiResponse<WeeklyReportDto>>(
      `/api/v1/weekly-reports/${reportId}`
    );
  }

  /**
   * Approve weekly report
   */
  async approveWeeklyReport(
    reportId: string
  ): Promise<ApiResponse<WeeklyReportDto>> {
    return this.apiClient.post<ApiResponse<WeeklyReportDto>>(
      `/api/v1/weekly-reports/${reportId}/approve`
    );
  }

  // ============================================================================
  // CALENDAR ENDPOINTS
  // ============================================================================

  /**
   * Get calendar events with filtering
   */
  async getCalendarEvents(params?: {
    StartDate?: string;
    EndDate?: string;
    EventType?: number;
    Status?: number;
    Priority?: number;
    ProjectId?: string;
    TaskId?: string;
    AssignedToUserId?: string;
    CreatedByUserId?: string;
    IncludePrivate?: boolean;
    Search?: string;
    Page?: number;
    PageSize?: number;
    SortBy?: string;
    SortOrder?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<CalendarEventDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<
      ApiResponse<EnhancedPagedResult<CalendarEventDto>>
    >(`/api/v1/Calendar${queryString ? `?${queryString}` : ""}`);
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(
    event: CreateCalendarEventDto
  ): Promise<ApiResponse<CalendarEventDto>> {
    return this.apiClient.post<ApiResponse<CalendarEventDto>>(
      "/api/v1/Calendar",
      event
    );
  }

  /**
   * Get calendar event by ID
   */
  async getCalendarEvent(id: string): Promise<ApiResponse<CalendarEventDto>> {
    return this.apiClient.get<ApiResponse<CalendarEventDto>>(
      `/api/v1/Calendar/${id}`
    );
  }

  /**
   * Update calendar event
   */
  async updateCalendarEvent(
    id: string,
    event: Partial<CreateCalendarEventDto>
  ): Promise<ApiResponse<CalendarEventDto>> {
    return this.apiClient.put<ApiResponse<CalendarEventDto>>(
      `/api/v1/Calendar/${id}`,
      event
    );
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/Calendar/${id}`
    );
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(params?: {
    days?: number;
    userId?: string;
  }): Promise<ApiResponse<CalendarEventDto[]>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<CalendarEventDto[]>>(
      `/api/v1/Calendar/upcoming${queryString ? `?${queryString}` : ""}`
    );
  }

  // ============================================================================
  // TASKS ENDPOINTS
  // ============================================================================

  /**
   * Get tasks with pagination
   */
  async getTasks(params?: {
    pageNumber?: number;
    pageSize?: number;
    projectId?: string;
    assigneeId?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<TaskDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<TaskDto>>>(
      `/api/v1/tasks${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Create new task
   */
  async createTask(
    task: CreateTaskRequest,
    projectId?: string
  ): Promise<ApiResponse<TaskDto>> {
    const queryString = projectId ? `?projectId=${projectId}` : "";
    return this.apiClient.post<ApiResponse<TaskDto>>(
      `/api/v1/tasks${queryString}`,
      task
    );
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<ApiResponse<TaskDto>> {
    return this.apiClient.get<ApiResponse<TaskDto>>(`/api/v1/tasks/${id}`);
  }

  /**
   * Update task
   */
  async updateTask(
    id: string,
    task: UpdateTaskRequest
  ): Promise<ApiResponse<TaskDto>> {
    return this.apiClient.put<ApiResponse<TaskDto>>(
      `/api/v1/tasks/${id}`,
      task
    );
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(`/api/v1/tasks/${id}`);
  }

  /**
   * Complete task
   */
  async completeTask(
    id: string,
    notes?: string
  ): Promise<ApiResponse<boolean>> {
    return this.apiClient.post<ApiResponse<boolean>>(
      `/api/v1/tasks/${id}/complete`,
      { notes }
    );
  }

  /**
   * Get advanced task search
   */
  async getTasksAdvanced(params?: {
    Title?: string;
    Status?: string;
    ProjectId?: string;
    AssigneeId?: string;
    DueDateAfter?: string;
    DueDateBefore?: string;
    CreatedAfter?: string;
    CreatedBefore?: string;
    CompletedAfter?: string;
    CompletedBefore?: string;
    PageNumber?: number;
    PageSize?: number;
    SortBy?: string;
    SortOrder?: string;
    Search?: string;
    Fields?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<TaskDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<TaskDto>>>(
      `/api/v1/tasks/advanced${queryString ? `?${queryString}` : ""}`
    );
  }

  // ============================================================================
  // MASTER PLANS ENDPOINTS
  // ============================================================================

  /**
   * Get master plans
   */
  async getMasterPlans(params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ApiResponse<MasterPlanDto[]>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<MasterPlanDto[]>>(
      `/api/v1/master-plans${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Create master plan
   */
  async createMasterPlan(
    plan: CreateMasterPlanRequest
  ): Promise<ApiResponse<MasterPlanDto>> {
    return this.apiClient.post<ApiResponse<MasterPlanDto>>(
      "/api/v1/master-plans",
      plan
    );
  }

  /**
   * Get master plan by ID
   */
  async getMasterPlan(id: string): Promise<ApiResponse<MasterPlanDto>> {
    return this.apiClient.get<ApiResponse<MasterPlanDto>>(
      `/api/v1/master-plans/${id}`
    );
  }

  /**
   * Update master plan
   */
  async updateMasterPlan(
    id: string,
    plan: Partial<CreateMasterPlanRequest>
  ): Promise<ApiResponse<MasterPlanDto>> {
    return this.apiClient.put<ApiResponse<MasterPlanDto>>(
      `/api/v1/master-plans/${id}`,
      plan
    );
  }

  /**
   * Delete master plan
   */
  async deleteMasterPlan(id: string): Promise<ApiResponse<any>> {
    return this.apiClient.delete<ApiResponse<any>>(
      `/api/v1/master-plans/${id}`
    );
  }

  /**
   * Get master plan by project ID
   */
  async getMasterPlanByProject(
    projectId: string
  ): Promise<ApiResponse<MasterPlanDto>> {
    return this.apiClient.get<ApiResponse<MasterPlanDto>>(
      `/api/v1/master-plans/project/${projectId}`
    );
  }

  /**
   * Approve master plan
   */
  async approveMasterPlan(
    id: string,
    comments?: string
  ): Promise<ApiResponse<any>> {
    return this.apiClient.post<ApiResponse<any>>(
      `/api/v1/master-plans/${id}/approve`,
      { comments }
    );
  }

  /**
   * Get master plan phases
   */
  async getMasterPlanPhases(
    id: string
  ): Promise<ApiResponse<ProjectPhaseDto[]>> {
    return this.apiClient.get<ApiResponse<ProjectPhaseDto[]>>(
      `/api/v1/master-plans/${id}/phases`
    );
  }

  /**
   * Get master plan milestones
   */
  async getMasterPlanMilestones(
    id: string
  ): Promise<ApiResponse<ProjectMilestoneDto[]>> {
    return this.apiClient.get<ApiResponse<ProjectMilestoneDto[]>>(
      `/api/v1/master-plans/${id}/milestones`
    );
  }

  // ============================================================================
  // DASHBOARD ENDPOINTS
  // ============================================================================

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(): Promise<ApiResponse<DashboardOverviewDto>> {
    return this.apiClient.get<ApiResponse<DashboardOverviewDto>>(
      "/api/v1/dashboard/overview"
    );
  }

  /**
   * Get project progress for dashboard
   */
  async getProjectProgress(): Promise<ApiResponse<any[]>> {
    return this.apiClient.get<ApiResponse<any[]>>(
      "/api/v1/dashboard/project-progress"
    );
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<any>>(
      `/api/v1/dashboard/statistics${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get live activity
   */
  async getLiveActivity(limit?: number): Promise<ApiResponse<any[]>> {
    const queryString = limit ? `?limit=${limit}` : "";
    return this.apiClient.get<ApiResponse<any[]>>(
      `/api/v1/dashboard/live-activity${queryString}`
    );
  }

  // ============================================================================
  // USERS ENDPOINTS
  // ============================================================================

  /**
   * Get users with pagination
   */
  async getUsers(params?: {
    pageNumber?: number;
    pageSize?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<User>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<User>>>(
      `/api/v1/users${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.apiClient.get<ApiResponse<User>>(`/api/v1/users/${id}`);
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    user: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.apiClient.put<ApiResponse<User>>(`/api/v1/users/${id}`, user);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(`/api/v1/users/${id}`);
  }

  // ============================================================================
  // NOTIFICATIONS ENDPOINTS
  // ============================================================================

  /**
   * Get notifications
   */
  async getNotifications(params?: {
    pageNumber?: number;
    pageSize?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<NotificationDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<
      ApiResponse<EnhancedPagedResult<NotificationDto>>
    >(`/api/v1/notifications${queryString ? `?${queryString}` : ""}`);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.put<ApiResponse<boolean>>(
      `/api/v1/notifications/${id}/read`
    );
  }

  /**
   * Get SignalR connection info
   */
  async getSignalRConnectionInfo(): Promise<ApiResponse<any>> {
    return this.apiClient.get<ApiResponse<any>>(
      "/api/v1/notifications/connection-info"
    );
  }

  // ============================================================================
  // RESOURCES ENDPOINTS
  // ============================================================================

  /**
   * Get resources
   */
  async getResources(params?: {
    ProjectId?: string;
    Type?: number;
    Status?: number;
    SupplierId?: string;
    MinCost?: number;
    MaxCost?: number;
    OrderDateAfter?: string;
    OrderDateBefore?: string;
    PageNumber?: number;
    PageSize?: number;
    SortBy?: string;
    SortOrder?: string;
    Search?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<ResourceDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<ResourceDto>>>(
      `/api/v1/resources${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Create resource
   */
  async createResource(resource: any): Promise<ApiResponse<ResourceDto>> {
    return this.apiClient.post<ApiResponse<ResourceDto>>(
      "/api/v1/resources",
      resource
    );
  }

  /**
   * Get resource by ID
   */
  async getResource(id: string): Promise<ApiResponse<ResourceDto>> {
    return this.apiClient.get<ApiResponse<ResourceDto>>(
      `/api/v1/resources/${id}`
    );
  }

  /**
   * Update resource
   */
  async updateResource(
    id: string,
    resource: any
  ): Promise<ApiResponse<ResourceDto>> {
    return this.apiClient.put<ApiResponse<ResourceDto>>(
      `/api/v1/resources/${id}`,
      resource
    );
  }

  /**
   * Delete resource
   */
  async deleteResource(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/resources/${id}`
    );
  }

  // ============================================================================
  // WORK REQUESTS ENDPOINTS
  // ============================================================================

  /**
   * Get work requests with filtering
   */
  async getWorkRequests(params?: {
    ProjectId?: string;
    RequestedById?: string;
    AssignedToId?: string;
    Status?: string;
    Priority?: string;
    Type?: string;
    PageNumber?: number;
    PageSize?: number;
    SortBy?: string;
    SortOrder?: string;
    Search?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<WorkRequestDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<WorkRequestDto>>>(
      `/api/v1/work-requests${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Create work request
   */
  async createWorkRequest(request: any): Promise<ApiResponse<WorkRequestDto>> {
    return this.apiClient.post<ApiResponse<WorkRequestDto>>(
      "/api/v1/work-requests",
      request
    );
  }

  /**
   * Get work request by ID
   */
  async getWorkRequest(id: string): Promise<ApiResponse<WorkRequestDto>> {
    return this.apiClient.get<ApiResponse<WorkRequestDto>>(
      `/api/v1/work-requests/${id}`
    );
  }

  /**
   * Update work request
   */
  async updateWorkRequest(
    id: string,
    request: any
  ): Promise<ApiResponse<WorkRequestDto>> {
    return this.apiClient.put<ApiResponse<WorkRequestDto>>(
      `/api/v1/work-requests/${id}`,
      request
    );
  }

  /**
   * Delete work request
   */
  async deleteWorkRequest(id: string): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/work-requests/${id}`
    );
  }

  // ============================================================================
  // IMAGES/DOCUMENTS ENDPOINTS
  // ============================================================================

  /**
   * Get images metadata
   */
  async getImages(params?: {
    projectId?: string;
    taskId?: string;
    pageNumber?: number;
    pageSize?: number;
    capturedAfter?: string;
    capturedBefore?: string;
    uploadedById?: string;
    contentType?: string;
    deviceModel?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<ImageMetadataDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<
      ApiResponse<EnhancedPagedResult<ImageMetadataDto>>
    >(`/api/v1/images${queryString ? `?${queryString}` : ""}`);
  }

  /**
   * Get documents
   */
  async getDocuments(params?: {
    ProjectId?: string;
    Category?: number;
    Status?: number;
    UploadedById?: string;
    Tags?: string;
    FileType?: string;
    CreatedAfter?: string;
    CreatedBefore?: string;
    PageNumber?: number;
    PageSize?: number;
    SortBy?: string;
    SortOrder?: string;
    Search?: string;
  }): Promise<ApiResponse<EnhancedPagedResult<DocumentDto>>> {
    const queryString = params
      ? new URLSearchParams(params as any).toString()
      : "";
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<DocumentDto>>>(
      `/api/v1/documents${queryString ? `?${queryString}` : ""}`
    );
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<any> {
    return this.apiClient.get<any>("/Health");
  }
}

// Export singleton instance
export const solarProjectApi = new SolarProjectApi();
