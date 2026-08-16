import { User } from "../auth";

// Tab Type for Dashboard Navigation
export type TabType =
    | "overview"
    | "projects"
    | "planning"
    | "analytics"
    | "reports"
    | "construction";

export interface TabItem {
    id: TabType;
    label: string;
    icon?: any;
    color?: string;
    count?: number;
}

// Project Status Enum
export enum ProjectStatus {
    PLANNING = "Planning",
    IN_PROGRESS = "InProgress",
    ON_HOLD = "OnHold",
    COMPLETED = "Completed",
    CANCELLED = "Cancelled",
}

// Connection Type Enum
export enum ConnectionType {
    LV = "LV", // Low Voltage
    MV = "MV", // Medium Voltage
    HV = "HV", // High Voltage
}

// Legacy Project interface for mock data and components (compatibility)
export interface Project {
    id: string;
    name: string;
    client: string;
    clientName?: string;
    status: string;
    progress: number;
    startDate: string;
    expectedCompletion: string;
    systemSize: string;
    location: string;
    priority: string;
    assignedTeam: string[];
    budget: number;
    spent: number;
}

// Project types based on your API schema
export interface ProjectDto {
    projectId: string;
    projectName: string | null;
    address: string | null;
    clientInfo: string | null;
    status: string | null;
    startDate: string;
    estimatedEndDate: string | null;
    actualEndDate: string | null;
    projectManagerId: string;
    projectManagerName: string | null;
    projectManager?: {
        id: string;
        userId?: string;
        name: string;
        fullName?: string;
        email?: string;
        username?: string;
        roleName?: string;
        roleId?: number;
        isActive?: boolean;
    };
    currentUserId: string | null;
    team: string | null;
    connectionType: string | null;
    connectionNotes: string | null;
    totalCapacityKw: number | null;
    pvModuleCount: number | null;
    equipmentDetails: EquipmentDetailsDto;
    ftsValue: number | null;
    revenueValue: number | null;
    pqmValue: number | null;
    taskCount: number;
    completedTaskCount: number;
    locationCoordinates: LocationCoordinatesDto;
    createdAt: string;
    updatedAt: string | null;
}

// Enhanced Equipment Details matching API documentation
export interface EquipmentDetailsDto {
    inverter125kw: number;
    inverter80kw: number;
    inverter60kw: number;
    inverter40kw: number;
}

export interface LocationCoordinatesDto {
    latitude: number;
    longitude: number;
}

export interface CreateProjectRequest {
    projectName: string;
    address: string;
    clientInfo?: string | null;
    startDate: string;
    estimatedEndDate?: string | null;
    projectManagerId: string;
    team?: string | null;
    connectionType?: string | null;
    connectionNotes?: string | null;
    totalCapacityKw?: number | null;
    pvModuleCount?: number | null;
    inverter125Kw?: number | null;
    inverter80Kw?: number | null;
    inverter60Kw?: number | null;
    inverter40Kw?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    supplierId?: string | null;
    orderDate?: string | null;
    deliveryDate?: string | null;
    ftsValue?: number | null;
    revenueValue?: number | null;
    pqmValue?: number | null;
}

export interface UpdateProjectRequest {
    projectName: string;
    address: string;
    clientInfo?: string | null;
    status: "Planning" | "InProgress" | "Completed" | "OnHold" | "Cancelled";
    startDate: string;
    estimatedEndDate?: string | null;
    actualEndDate?: string | null;
    projectManagerId: string;
    ftsValue?: number | null;
    revenueValue?: number | null;
    pqmValue?: number | null;
}

export interface UpdateProjectStatusRequest {
    status: string;
    reason: string;
    effectiveDate: string;
    notifyStakeholders: boolean;
}

export interface ProjectStatusUpdateResponse {
    projectId: string;
    previousStatus: string;
    newStatus: string;
    effectiveDate: string;
    updatedBy: {
        userId: string;
        fullName: string;
    };
    notifications: {
        sent: number;
        failed: number;
        recipients: string[];
    };
}

export interface PatchProjectRequest {
    projectName?: string | null;
    address?: string | null;
    clientInfo?: string | null;
    status?:
    | "Planning"
    | "InProgress"
    | "Completed"
    | "OnHold"
    | "Cancelled"
    | null;
    startDate?: string | null;
    estimatedEndDate?: string | null;
    actualEndDate?: string | null;
    projectManagerId?: string | null;
}

// Enhanced Project Status Response
export interface ProjectStatusDto {
    projectId: string;
    projectName: string;
    status: string;
    plannedStartDate: string;
    plannedEndDate: string | null;
    actualStartDate: string | null;
    overallCompletionPercentage: number;
    isOnSchedule: boolean;
    isOnBudget: boolean;
    activeTasks: number;
    completedTasks: number;
    totalTasks: number;
    lastUpdated: string;
    links: ProjectLink[];
}

export interface ProjectLink {
    href: string;
    rel: string;
    method: string;
}

// Backward compatibility type aliases
export type NewProjectForm = CreateProjectRequest;
export type UpdateProjectForm = UpdateProjectRequest;
