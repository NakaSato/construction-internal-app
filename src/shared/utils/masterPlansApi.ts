import { apiClient } from "./apiClient";
import { ApiResponse } from "../types/api";

// Master Plan Types
export interface MasterPlanDto {
    masterPlanId: string;
    projectId: string;
    planName: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalBudget?: number;
    status: string;
    phases: MasterPlanPhaseDto[];
    createdAt: string;
    updatedAt?: string;
}

export interface MasterPlanPhaseDto {
    phaseId: string;
    phaseName: string;
    description?: string;
    startDate: string;
    endDate: string;
    budget?: number;
    progressPercentage: number;
    status: string;
    milestones: ProjectMilestoneDto[];
}

export interface ProjectMilestoneDto {
    milestoneId: string;
    milestoneName: string;
    description?: string;
    targetDate: string;
    actualCompletionDate?: string;
    isCompleted: boolean;
    completedById?: string;
    completionNotes?: string;
}

export interface CreateMasterPlanRequest {
    projectId: string;
    planName: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalBudget?: number;
    phases?: CreatePhaseRequest[];
}

export interface CreatePhaseRequest {
    phaseName: string;
    description?: string;
    startDate: string;
    endDate: string;
    budget?: number;
    dependencies?: string[];
    milestones?: CreateMilestoneRequest[];
}

export interface CreateMilestoneRequest {
    milestoneName: string;
    description?: string;
    targetDate: string;
}

export interface CompleteMilestoneRequest {
    actualCompletionDate: string;
    completionNotes?: string;
}

/**
 * Master Plans API Service
 */
export class MasterPlansApiService {
    private readonly endpoint = "/api/v1/master-plans";

    /**
     * Get all master plans
     */
    async getAllMasterPlans(): Promise<MasterPlanDto[]> {
        try {
            const response = await apiClient.get<ApiResponse<{ items: MasterPlanDto[] }>>(this.endpoint);
            return response.data?.items || [];
        } catch (error) {
            console.error("Failed to fetch master plans:", error);
            throw new Error("Failed to fetch master plans");
        }
    }

    /**
     * Get master plan by ID
     */
    async getMasterPlanById(id: string): Promise<MasterPlanDto> {
        try {
            const response = await apiClient.get<ApiResponse<MasterPlanDto>>(`${this.endpoint}/${id}`);
            if (!response.data) {
                throw new Error("Master plan not found");
            }
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch master plan ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get master plans by project ID
     */
    async getMasterPlansByProject(projectId: string): Promise<MasterPlanDto[]> {
        try {
            const response = await apiClient.get<ApiResponse<MasterPlanDto[]>>(
                `${this.endpoint}/project/${projectId}`
            );
            return response.data || [];
        } catch (error) {
            console.error(`Failed to fetch master plans for project ${projectId}:`, error);
            return [];
        }
    }

    /**
     * Create new master plan
     */
    async createMasterPlan(data: CreateMasterPlanRequest): Promise<MasterPlanDto> {
        try {
            const response = await apiClient.post<ApiResponse<MasterPlanDto>>(this.endpoint, data);
            if (!response.data) {
                throw new Error("Failed to create master plan");
            }
            return response.data;
        } catch (error) {
            console.error("Failed to create master plan:", error);
            throw error;
        }
    }

    /**
     * Get milestones for a master plan
     */
    async getMilestones(masterPlanId: string): Promise<ProjectMilestoneDto[]> {
        try {
            const response = await apiClient.get<ApiResponse<ProjectMilestoneDto[]>>(
                `${this.endpoint}/${masterPlanId}/milestones`
            );
            return response.data || [];
        } catch (error) {
            console.error(`Failed to fetch milestones for master plan ${masterPlanId}:`, error);
            return [];
        }
    }

    /**
     * Add phase with milestones to master plan
     */
    async addPhase(masterPlanId: string, phase: CreatePhaseRequest): Promise<MasterPlanPhaseDto> {
        try {
            const response = await apiClient.post<ApiResponse<MasterPlanPhaseDto>>(
                `${this.endpoint}/${masterPlanId}/phases`,
                phase
            );
            if (!response.data) {
                throw new Error("Failed to add phase");
            }
            return response.data;
        } catch (error) {
            console.error(`Failed to add phase to master plan ${masterPlanId}:`, error);
            throw error;
        }
    }

    /**
     * Complete a milestone
     */
    async completeMilestone(
        masterPlanId: string,
        milestoneId: string,
        data: CompleteMilestoneRequest
    ): Promise<boolean> {
        try {
            await apiClient.patch<ApiResponse<void>>(
                `${this.endpoint}/${masterPlanId}/milestones/${milestoneId}/complete`,
                data
            );
            return true;
        } catch (error) {
            console.error(`Failed to complete milestone ${milestoneId}:`, error);
            throw error;
        }
    }

    /**
     * Get master plan progress summary
     */
    async getProgress(masterPlanId: string): Promise<{
        totalMilestones: number;
        completedMilestones: number;
        overallProgress: number;
    }> {
        try {
            const response = await apiClient.get<ApiResponse<{
                totalMilestones: number;
                completedMilestones: number;
                overallProgress: number;
            }>>(`${this.endpoint}/${masterPlanId}/progress`);
            return response.data || { totalMilestones: 0, completedMilestones: 0, overallProgress: 0 };
        } catch (error) {
            console.error(`Failed to fetch progress for master plan ${masterPlanId}:`, error);
            return { totalMilestones: 0, completedMilestones: 0, overallProgress: 0 };
        }
    }
}

// Create and export singleton instance
export const masterPlansApi = new MasterPlansApiService();
