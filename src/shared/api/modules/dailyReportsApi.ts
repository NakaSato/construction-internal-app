import { ApiClient } from "../../utils/apiClient";
import { ApiResponse, EnhancedPagedResult } from "../../types/api";
import {
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
  EnhancedDailyReportDto,
  CreateEnhancedDailyReportRequest,
  CreateWorkProgressItemRequest,
  UpdateWorkProgressItemRequest,
  WeeklySummaryDto,
  DailyReportInsightsDto,
  WorkProgressItemDto,
  BulkOperationResultDto,
  DailyReportAttachmentDto,
} from "../../types/project";

/**
 * Daily Reports API module
 * Handles all daily report management endpoints
 */
export class DailyReportsApi {
  constructor(private apiClient: ApiClient) { }

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
    report: UpdateDailyReportRequest
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
      `/api/v1/daily-reports/projects/${projectId}${queryString ? `?${queryString}` : ""
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
      `/api/v1/daily-reports/pending-approval${queryString ? `?${queryString}` : ""
      }`
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
      `/api/v1/daily-reports/projects/${projectId}/analytics?startDate=${startDate}&endDate=${endDate}`
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
   * Add attachment to daily report
   */
  async addAttachment(
    id: string,
    file: File
  ): Promise<ApiResponse<DailyReportAttachmentDto>> {
    const formData = new FormData();
    formData.append("file", file);
    return this.apiClient.post<ApiResponse<DailyReportAttachmentDto>>(
      `/api/v1/daily-reports/${id}/attachments`,
      formData
    );
  }

  /**
   * Get weekly summary report
   */
  async getWeeklySummary(
    projectId?: string,
    weekStartDate?: string
  ): Promise<ApiResponse<WeeklySummaryDto>> {
    const params = new URLSearchParams();
    if (projectId) params.append("projectId", projectId);
    if (weekStartDate) params.append("weekStartDate", weekStartDate);
    return this.apiClient.get<ApiResponse<WeeklySummaryDto>>(
      `/api/v1/daily-reports/weekly-summary?${params.toString()}`
    );
  }

  /**
   * Add work progress item
   */
  async addWorkProgressItem(
    reportId: string,
    item: CreateWorkProgressItemRequest
  ): Promise<ApiResponse<WorkProgressItemDto>> {
    return this.apiClient.post<ApiResponse<WorkProgressItemDto>>(
      `/api/v1/daily-reports/${reportId}/work-progress`,
      item
    );
  }

  /**
   * Update work progress item
   */
  async updateWorkProgressItem(
    reportId: string,
    itemId: string,
    item: UpdateWorkProgressItemRequest
  ): Promise<ApiResponse<WorkProgressItemDto>> {
    return this.apiClient.put<ApiResponse<WorkProgressItemDto>>(
      `/api/v1/daily-reports/${reportId}/work-progress/${itemId}`,
      item
    );
  }

  /**
   * Delete work progress item
   */
  async deleteWorkProgressItem(
    reportId: string,
    itemId: string
  ): Promise<ApiResponse<boolean>> {
    return this.apiClient.delete<ApiResponse<boolean>>(
      `/api/v1/daily-reports/${reportId}/work-progress/${itemId}`
    );
  }

  /**
   * Create enhanced daily report
   */
  async createEnhancedDailyReport(
    request: CreateEnhancedDailyReportRequest
  ): Promise<ApiResponse<EnhancedDailyReportDto>> {
    return this.apiClient.post<ApiResponse<EnhancedDailyReportDto>>(
      "/api/v1/daily-reports/enhanced",
      request
    );
  }

  /**
   * Get weekly progress report for project
   */
  async getWeeklyProgressReport(
    projectId: string,
    weekStartDate?: string
  ): Promise<ApiResponse<WeeklySummaryDto>> {
    const params = weekStartDate ? `?weekStartDate=${weekStartDate}` : "";
    return this.apiClient.get<ApiResponse<WeeklySummaryDto>>(
      `/api/v1/daily-reports/projects/${projectId}/weekly-report${params}`
    );
  }

  /**
   * Export enhanced daily reports
   */
  async exportEnhancedDailyReports(
    request: DailyReportExportRequest
  ): Promise<ApiResponse<Blob>> {
    return this.apiClient.post<ApiResponse<Blob>>(
      "/api/v1/daily-reports/export-enhanced",
      request,
      {
        responseType: "blob",
      }
    );
  }

  /**
   * Get daily report insights
   */
  async getDailyReportInsights(
    projectId: string,
    reportId?: string
  ): Promise<ApiResponse<DailyReportInsightsDto>> {
    const params = reportId ? `?reportId=${reportId}` : "";
    return this.apiClient.get<ApiResponse<DailyReportInsightsDto>>(
      `/api/v1/daily-reports/projects/${projectId}/insights${params}`
    );
  }

  /**
   * Search daily reports
   */
  async searchDailyReports(
    params: GetDailyReportsParams
  ): Promise<ApiResponse<EnhancedPagedResult<DailyReportDto>>> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.apiClient.get<ApiResponse<EnhancedPagedResult<DailyReportDto>>>(
      `/api/v1/daily-reports/search?${queryString}`
    );
  }
}
