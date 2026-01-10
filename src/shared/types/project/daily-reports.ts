import { ProjectStatus } from "./core";

// ============================================================================
// DAILY REPORTS TYPES
// ============================================================================

// Daily Report Status Enum
export enum DailyReportApprovalStatus {
    DRAFT = "Draft",
    SUBMITTED = "Submitted",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    REVISION_REQUIRED = "RevisionRequired",
}

// Weather Conditions Enum
export enum WeatherCondition {
    SUNNY = "Sunny",
    PARTLY_CLOUDY = "PartlyCloudy",
    CLOUDY = "Cloudy",
    RAINY = "Rainy",
    STORMY = "Stormy",
    SNOWY = "Snowy",
    WINDY = "Windy",
    FOGGY = "Foggy",
}

// Daily Report Core Interface
export interface DailyReportDto {
    id: string;
    projectId: string;
    projectName: string;
    userId: string;
    userName: string;
    reportDate: string;
    approvalStatus: DailyReportApprovalStatus;
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    totalWorkHours: number;
    hoursWorked: number; // Compatibility field
    personnelOnSite: number;
    weatherCondition: string;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    weatherImpact?: string;
    workSummary: string;
    workAccomplished?: string;
    workPlannedNextDay?: string;
    issues?: string;
    safetyScore: number;
    qualityScore: number;
    dailyProgressContribution: number;
    hasCriticalIssues: boolean;
    requiresManagerAttention: boolean;
    additionalNotes?: string;
    workProgressItems: DailyReportTaskProgress[];
    materialUsages: DailyReportMaterialUsage[];
    attachments: DailyReportAttachment[];
    createdAt: string;
    updatedAt?: string;
    hasAttachments: boolean;
    canEdit: boolean;
    canSubmit: boolean;
}

// Daily Report Task Progress
export interface DailyReportTaskProgress {
    taskId: string;
    title?: string;
    completionPercentage: number;
    startPercentage?: number;
    endPercentage?: number;
    progressMade?: number;
    status?: string;
    isOnSchedule?: boolean;
    notes?: string;
}

// Daily Report Material Usage
export interface DailyReportMaterialUsage {
    materialId?: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost?: number;
    totalCost?: number;
    notes?: string;
}

// Daily Report Attachment
export interface DailyReportAttachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    category?: string;
    uploadedAt: string;
    thumbnailUrl?: string;
}

// Work Progress Item
export interface WorkProgressItem {
    taskId: string;
    title: string;
    completionPercentage: number;
    status: string;
    notes?: string;
    progressMade: number;
    impediments?: string;
}

// Personnel Log
export interface PersonnelLog {
    userId: string;
    name?: string;
    hoursWorked: number;
    role: string;
    specialAssignments?: string;
    notes?: string;
}

// Equipment Log
export interface EquipmentLog {
    equipmentId: string;
    hoursUsed: number;
    condition: string;
    issues?: string;
    maintenanceNotes?: string;
}

// Create Daily Report Request
export interface CreateDailyReportRequest {
    projectId: string;
    reportDate: string;
    totalWorkHours: number;
    hoursWorked?: number; // Compatibility field
    personnelOnSite: number;
    weatherCondition: string;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    weatherImpact?: string;
    weatherDescription?: string;
    workSummary: string;
    workAccomplished?: string;
    workPlannedNextDay?: string;
    issues?: string;
    safetyScore: number;
    qualityScore: number;
    dailyProgressContribution: number;
    additionalNotes?: string;
    workProgressItems?: DailyReportTaskProgress[];
    materialUsages?: DailyReportMaterialUsage[];
}

// Enhanced Create Daily Report Request
export interface CreateEnhancedDailyReportRequest
    extends CreateDailyReportRequest {
    weatherCondition: WeatherCondition;
    weatherDescription?: string;
    personnelLogs?: PersonnelLog[];
    equipmentLogs?: EquipmentLog[];
}

// Update Daily Report Request
export interface UpdateDailyReportRequest {
    totalWorkHours?: number;
    hoursWorked?: number; // Compatibility field
    personnelOnSite?: number;
    weatherCondition?: string;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    weatherImpact?: string;
    workSummary?: string;
    workAccomplished?: string;
    workPlannedNextDay?: string;
    issues?: string;
    safetyScore?: number;
    qualityScore?: number;
    dailyProgressContribution?: number;
    additionalNotes?: string;
    workProgressItems?: DailyReportTaskProgress[];
    materialUsages?: DailyReportMaterialUsage[];
}

// Daily Report Query Parameters
export interface GetDailyReportsParams {
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    approvalStatus?: DailyReportApprovalStatus;
    minSafetyScore?: number;
    minQualityScore?: number;
    weatherCondition?: WeatherCondition;
    hasCriticalIssues?: boolean;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    pageNumber?: number;
    pageSize?: number;
}

// Daily Report Summary
export interface DailyReportSummary {
    totalReports: number;
    averageSafetyScore: number;
    averageQualityScore: number;
    totalHoursLogged: number;
    totalProgressContribution: number;
    criticalIssuesCount: number;
    pendingApprovals: number;
}

// Daily Report Analytics
export interface DailyReportAnalytics {
    projectId: string;
    projectName: string;
    analysisPeriodStart: string;
    analysisPeriodEnd: string;
    totalReports: number;
    totalHoursLogged: number;
    averageHoursPerDay: number;
    averageSafetyScore: number;
    averageQualityScore: number;
    totalProgressContribution: number;
    averageProgressPerDay: number;
    daysAheadBehindSchedule: number;
    totalCriticalIssues: number;
    weatherDelayDays: number;
    topIssueCategories: string[];
    averageTeamSize: number;
    productivityIndex: number;
    topPerformers: TopPerformer[];
    weatherConditionDays: Record<string, number>;
    weatherImpactScore: number;
    progressTrend: TrendDataPoint[];
    safetyTrend: TrendDataPoint[];
}

// Top Performer
export interface TopPerformer {
    userId: string;
    name: string;
    reportsSubmitted: number;
    averageHoursPerDay: number;
    averageSafetyScore: number;
    averageQualityScore: number;
    productivityScore: number;
}

// Trend Data Point
export interface TrendDataPoint {
    date: string;
    value: number;
}

// Weekly Progress Report
export interface WeeklyProgressReport {
    projectId: string;
    projectName: string;
    weekStartDate: string;
    weekEndDate: string;
    reportsSubmitted: number;
    totalHours: number;
    progressMade: number;
    teamMemberCount: number;
    dailyProgress: DailyProgressSummary[];
    keyAccomplishments: string[];
    criticalIssues: string[];
    upcomingMilestones: string[];
    averageSafetyScore: number;
    averageQualityScore: number;
    isOnSchedule: boolean;
    productivityIndex: number;
}

// Daily Progress Summary
export interface DailyProgressSummary {
    date: string;
    hours: number;
    progress: number;
    teamSize: number;
    weatherCondition: string;
    hasIssues: boolean;
    safetyScore: number;
    qualityScore: number;
}

// Daily Report Insights
export interface DailyReportInsights {
    projectId: string;
    projectName: string;
    generatedAt: string;
    performanceInsights: string[];
    productivityRecommendations: string[];
    riskLevel: "Low" | "Medium" | "High";
    identifiedRisks: string[];
    riskMitigationSuggestions: string[];
    isOnTrack: boolean;
    progressVelocity: number;
    estimatedDaysToCompletion: number;
    safetyRecommendations: string[];
    qualityImprovements: string[];
    trends: InsightTrend[];
}

// Insight Trend
export interface InsightTrend {
    category: string;
    trend: "Improving" | "Stable" | "Declining";
    description: string;
    changePercent: number;
    recommendation: string;
}

// Daily Report Validation Result
export interface DailyReportValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    suggestions: string[];
    ruleResults: ValidationRuleResult[];
    autoCorrections: AutoCorrection[];
}

// Validation Error
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

// Validation Rule Result
export interface ValidationRuleResult {
    ruleName: string;
    severity: "Error" | "Warning" | "Info";
    passed: boolean;
    message: string;
    suggestion?: string;
}

// Auto Correction
export interface AutoCorrection {
    field: string;
    currentValue: any;
    suggestedValue: any;
    reason: string;
    confidence: number;
}

// Enhanced project status workflow
export interface ProjectStatusWorkflow {
    currentStatus: ProjectStatus;
    allowedTransitions: ProjectStatus[];
    requiresApproval: boolean;
    approvalLevel?: "manager" | "admin";
    statusHistory: ProjectStatusHistoryEntry[];
}

export interface ProjectStatusHistoryEntry {
    status: ProjectStatus;
    changedAt: string;
    changedBy: {
        userId: string;
        fullName: string;
    };
    reason?: string;
    duration?: number; // days in this status
}

// Enhanced project status response with analytics integration
export interface ProjectStatusResponse extends DailyReportSummary {
    projectId: string;
    projectName: string;
    currentStatus: ProjectStatus;
    workflow: ProjectStatusWorkflow;
    lastReportDate: string;
    aiInsights?: DailyReportInsights;
}

// Daily Report Export Request
export interface DailyReportExportRequest {
    projectId?: string;
    startDate: string;
    endDate: string;
    format: "csv" | "excel" | "pdf" | "json";
    includeAttachments?: boolean;
    includeAnalytics?: boolean;
    fieldsToInclude?: string[];
}

// Enhanced Daily Report DTO
export interface EnhancedDailyReportDto extends DailyReportDto {
    projectStatus: string;
    projectManager: {
        id: string;
        name: string;
    };
    weatherSummary: string;
    complianceStatus: {
        safetyCompliant: boolean;
        environmentalCompliant: boolean;
    };
    aiInsights?: DailyReportInsights;
}

// Work Progress Item Requests
export interface CreateWorkProgressItemRequest {
    activity: string;
    description: string;
    hoursWorked: number;
    percentageComplete: number;
    workersAssigned: number;
    notes?: string;
}

export interface UpdateWorkProgressItemRequest {
    activity?: string;
    description?: string;
    hoursWorked?: number;
    percentageComplete?: number;
    workersAssigned?: number;
    notes?: string;
}

// Enhanced Project Daily Report Query Parameters
export interface EnhancedDailyReportQueryParameters extends GetDailyReportsParams {
    includeAnalytics?: boolean;
    includeAttachments?: boolean;
    includeWorkProgress?: boolean;
    includeWeather?: boolean;
}

// Weekly Summary DTO (Aliases to WeeklyProgressReport or expands it)
export type WeeklySummaryDto = WeeklyProgressReport;

// Daily Report Insights DTO
export type DailyReportInsightsDto = DailyReportInsights;

// Validation Result DTO
export type DailyReportValidationResultDto = DailyReportValidationResult;

// Work Progress Item DTO
export type WorkProgressItemDto = WorkProgressItem;

// Bulk Result DTO
export type BulkOperationResultDto = BulkOperationResult;

// Attachment DTO
export type DailyReportAttachmentDto = DailyReportAttachment;

// Support types for mixed functionality
export interface DailyReportNotificationSettings {
    reportSubmissions: boolean;
    approvals: boolean;
    rejections: boolean;
    criticalIssues: boolean;
}

// Bulk Approval/Rejection Request
export interface BulkApprovalRequest {
    reportIds: string[];
    comments?: string;
}

export interface BulkRejectionRequest {
    reportIds: string[];
    rejectionReason: string;
}

// Bulk Operation Result
export interface BulkOperationResult {
    totalRequested: number;
    successCount: number;
    failureCount: number;
    results: BulkOperationItemResult[];
    summary: string;
}

export interface BulkOperationItemResult {
    itemId: string;
    success: boolean;
    details: string;
}
