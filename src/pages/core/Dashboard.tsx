import React, { useState } from "react";
import { useAuth, useRole } from "@hooks/useAuth";
import { useDashboard } from "@shared/contexts";
import { ProtectedRoute } from "@features/auth";
import { ProjectManagement } from "@features/projects";
import { CreateProjectRequest } from "@shared/types/project";
import {
  ProjectEntity,
  ActivityStatus,
  ProjectStatus,
} from "@shared/types/project-management";
import { useProjects } from "@hooks/useProjects";

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin, isManager, roleName } = useRole();
  const { activeTab } = useDashboard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [useEnhancedModal, setUseEnhancedModal] = useState(true); // Toggle between modals

  // Demo project for master plan components.
  // Seeded via a lazy initializer so the impure Date calls run once (not during render).
  const [demoProject] = useState<ProjectEntity>(() => ({
    projectId: "demo-001",
    projectName: "Solar Installation Demo",
    projectOwner: "Demo Owner",
    mainContractor: "Demo Contractor",
    plannedStartDate: new Date(),
    plannedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    actualStartDate: new Date(),
    actualEndDate: undefined,
    status: ProjectStatus.IN_PROGRESS,
    overallCompletion: 0.25,
    phases: [
      {
        phaseId: "phase-1",
        projectId: "demo-001",
        phaseName: "Planning & Design",
        weight: 0.3,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        actualStartDate: new Date(),
        actualEndDate: undefined,
        completion: 0.25,
        order: 1,
        activities: [
          {
            activityId: "activity-1",
            phaseId: "phase-1",
            activityName: "Site Survey",
            duration: 7,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            actualStartDate: new Date(),
            actualEndDate: undefined,
            percentComplete: 0.5,
            weight: 0.5,
            assignedResources: [],
            dependencies: [],
            documents: [],
            isOnCriticalPath: true,
            status: ActivityStatus.IN_PROGRESS,
            notes: "Initial site survey and measurements",
          },
        ],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Use the projects hook with API integration
  const {
    projects,
    loading,
    error,
    stats,
    statsLoading,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
    refreshStats,
    getConstructionProjects,
    getProjectStats,
  } = useProjects();

  const [newProject, setNewProject] = useState<CreateProjectRequest>({
    projectName: "",
    address: "",
    clientInfo: "",
    startDate: "",
    estimatedEndDate: "",
    projectManagerId: user?.userId || "",
    totalCapacityKw: 0,
    pvModuleCount: 0,
    ftsValue: 0,
    revenueValue: 0,
    pqmValue: 0,
    inverter125Kw: 0,
    inverter80Kw: 0,
    inverter60Kw: 0,
    inverter40Kw: 0,
    latitude: 0,
    longitude: 0,
    connectionType: "LV",
    connectionNotes: "",
  });

  const handleCreateProject = async () => {
    try {
      await createProject(newProject);

      // Reset form and close modal
      setNewProject({
        projectName: "",
        address: "",
        clientInfo: "",
        startDate: "",
        estimatedEndDate: "",
        projectManagerId: user?.userId || "",
        totalCapacityKw: 0,
        pvModuleCount: 0,
        ftsValue: 0,
        revenueValue: 0,
        pqmValue: 0,
        inverter125Kw: 0,
        inverter80Kw: 0,
        inverter60Kw: 0,
        inverter40Kw: 0,
        latitude: 0,
        longitude: 0,
        connectionType: "LV",
        connectionNotes: "",
      });
      setShowCreateModal(false);

      alert("Project created successfully!");
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const handleInputChange = (field: keyof CreateProjectRequest, value: any) => {
    setNewProject((prev: CreateProjectRequest) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <ProtectedRoute>
      <ProjectManagement />
    </ProtectedRoute>
  );
}
