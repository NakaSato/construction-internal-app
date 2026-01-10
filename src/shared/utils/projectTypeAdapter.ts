import { Project, ProjectDto } from "../types/project";
import { ProjectEntity, ProjectStatus } from "../types/project-management";

// Convert ProjectDto to ProjectEntity for project management components
export function projectDtoToProjectEntity(dto: ProjectDto): ProjectEntity {
  // Map status from string to enum
  const mapStatus = (status: string | null): ProjectStatus => {
    switch (status?.toLowerCase()) {
      case "planning":
        return ProjectStatus.PLANNING;
      case "inprogress":
        return ProjectStatus.IN_PROGRESS;
      case "onhold":
        return ProjectStatus.ON_HOLD;
      case "completed":
        return ProjectStatus.COMPLETED;
      case "cancelled":
        return ProjectStatus.CANCELLED;
      default:
        return ProjectStatus.PLANNING;
    }
  };

  // Calculate overall completion from task progress
  const overallCompletion =
    dto.taskCount > 0 ? dto.completedTaskCount / dto.taskCount : 0;

  return {
    projectId: dto.projectId,
    projectName: dto.projectName || "Unnamed Project",
    projectOwner: dto.clientInfo || "Unknown Owner",
    mainContractor: dto.projectManager?.fullName || "Unknown Contractor",
    plannedStartDate: new Date(dto.startDate),
    plannedEndDate: dto.estimatedEndDate
      ? new Date(dto.estimatedEndDate)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days
    actualStartDate: dto.startDate ? new Date(dto.startDate) : undefined,
    actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : undefined,
    status: mapStatus(dto.status),
    overallCompletion,
    phases: [], // Will be populated from separate API calls if needed
    createdAt: new Date(dto.createdAt),
    updatedAt: dto.updatedAt
      ? new Date(dto.updatedAt)
      : new Date(dto.createdAt),
  };
}

// Convert array of ProjectDto to ProjectEntity array
export function projectDtosToProjectEntities(
  dtos: ProjectDto[]
): ProjectEntity[] {
  return dtos.map(projectDtoToProjectEntity);
}

// Temporary adapter function to convert ProjectDto to Project for legacy components
export function projectDtoToProject(dto: ProjectDto): Project {
  const progress =
    dto.completedTaskCount > 0 && dto.taskCount > 0
      ? Math.round((dto.completedTaskCount / dto.taskCount) * 100)
      : 0;

  return {
    id: dto.projectId,
    name: dto.projectName || "Unnamed Project",
    client: dto.clientInfo || "Unknown Client",
    clientName: dto.clientInfo || "Unknown Client",
    status: dto.status || "Planning",
    progress,
    startDate: dto.startDate,
    expectedCompletion: dto.estimatedEndDate || dto.startDate,
    systemSize: dto.totalCapacityKw ? `${dto.totalCapacityKw} kW` : "Unknown",
    location: dto.address || "Unknown Location",
    priority: "Medium", // Default priority
    assignedTeam: dto.team ? [dto.team] : [],
    budget: dto.revenueValue || 0,
    spent: 0, // Not available in ProjectDto
  };
}

// Convert array of ProjectDto to Project array
export function projectDtosToProjects(dtos: ProjectDto[]): Project[] {
  return dtos.map(projectDtoToProject);
}

// Reverse adapter function to convert Project back to ProjectDto for API calls
export function projectToProjectDto(project: Project): ProjectDto {
  return {
    projectId: project.id,
    projectName: project.name,
    address: project.location,
    clientInfo: project.client,
    status: project.status,
    startDate: project.startDate,
    estimatedEndDate: project.expectedCompletion,
    actualEndDate: null,
    projectManagerId: "unknown-id",
    projectManagerName: "Unknown Manager",
    currentUserId: null,
    updatedAt: null,
    projectManager: {
      id: "unknown",
      name: "Unknown Manager",
      userId: "unknown",
      username: "unknown",
      email: "",
      fullName: "Unknown Manager",
      roleName: "ProjectManager",
      roleId: 1,
      isActive: true,
    },
    taskCount: 100, // Estimate based on progress
    completedTaskCount: Math.round((project.progress / 100) * 100),
    team: project.assignedTeam.join(", "),
    connectionType: null,
    connectionNotes: null,
    totalCapacityKw: project.systemSize
      ? parseFloat(project.systemSize.replace(/[^\d.]/g, ""))
      : null,
    pvModuleCount: null,
    equipmentDetails: {
      inverter125kw: 0,
      inverter80kw: 0,
      inverter60kw: 0,
      inverter40kw: 0,
    },
    ftsValue: null,
    revenueValue: project.budget,
    pqmValue: null,
    locationCoordinates: { latitude: 0, longitude: 0 },
    createdAt: new Date().toISOString(),
  };
}

// Convert array of Project to ProjectDto array
export function projectsToProjectDtos(projects: Project[]): ProjectDto[] {
  return projects.map(projectToProjectDto);
}
