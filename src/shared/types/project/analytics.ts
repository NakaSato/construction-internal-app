// Project Analytics Types
export interface ProjectAnalyticsDto {
    summary: ProjectAnalyticsSummary;
    statusBreakdown: Record<string, number>;
    performanceMetrics: ProjectPerformanceMetrics;
    trends: ProjectTrends;
    topPerformers: TopPerformers;
}

export interface ProjectAnalyticsSummary {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalCapacity: number;
    averageCompletionTime: number;
    onTimeDeliveryRate: number;
}

export interface ProjectPerformanceMetrics {
    averageProjectDuration: number;
    budgetVariance: number;
    qualityScore: number;
    customerSatisfaction: number;
    teamEfficiency: number;
}

export interface ProjectTrends {
    projectsPerMonth: MonthlyProjectData[];
    capacityTrends: MonthlyCapacityData[];
}

export interface MonthlyProjectData {
    month: string;
    count: number;
    completed: number;
}

export interface MonthlyCapacityData {
    month: string;
    totalKw: number;
}

export interface TopPerformers {
    managers: TopManagerDto[];
    projects: TopProjectDto[];
}

export interface TopManagerDto {
    managerId: string;
    fullName: string;
    projectCount: number;
    completionRate: number;
    averageDuration: number;
}

export interface TopProjectDto {
    projectId: string;
    projectName: string;
    completionRate: number;
    onTimeDelivery: boolean;
    budgetVariance: number;
}

// Project Performance Tracking
export interface ProjectPerformanceDto {
    projectId: string;
    projectName: string;
    performanceScore: number;
    kpis: ProjectKPIs;
    milestones: ProjectMilestone[];
    resourceUtilization: ResourceUtilization;
    riskAssessment: RiskAssessment;
    progressHistory: ProgressHistoryEntry[];
}

export interface ProjectKPIs {
    timelineAdherence: number;
    budgetAdherence: number;
    qualityScore: number;
    safetyScore: number;
    clientSatisfaction: number;
}

export interface ProjectMilestone {
    milestoneId: string;
    title: string;
    targetDate: string;
    actualDate: string | null;
    status: string;
    varianceDays: number;
}

export interface CreateProjectMilestoneRequest {
    name: string;
    description?: string;
    dueDate: string;
    priority: number;
}

export interface UpdateProjectMilestoneRequest {
    name: string;
    description?: string;
    dueDate: string;
    priority: number;
    status?: string;
    actualDate?: string | null;
}

export interface ResourceUtilization {
    teamUtilization: number;
    equipmentUtilization: number;
    materialEfficiency: number;
}

export interface RiskAssessment {
    overallRiskLevel: string;
    activeRisks: number;
    mitigatedRisks: number;
    riskTrend: string;
}

export interface ProgressHistoryEntry {
    date: string;
    completionPercentage: number;
    tasksCompleted: number;
    hoursWorked: number;
    issues: number;
}
