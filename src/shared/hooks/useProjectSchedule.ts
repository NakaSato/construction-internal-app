import { useState, useEffect, useCallback } from "react";
import { ProjectEntity, ProjectStatus } from "../types/project-management";
import { ProjectSchedule, ScheduleHealth } from "../types/schedule";
// import { solarProjectApi } from "../api/solarProjectApi"; // TODO: Use when API is implemented

export const useProjectSchedule = (projectId: string) => {
  const [schedule, setSchedule] = useState<ProjectSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduleData = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, create a mock project until we implement the real API call
      // TODO: Replace with actual API call when available
      const mockProject: ProjectEntity = {
        projectId,
        projectName: `Solar Project ${projectId}`,
        projectOwner: "PWA Phayao",
        mainContractor: "PEA",
        plannedStartDate: new Date("2024-01-01"),
        plannedEndDate: new Date("2024-12-31"),
        actualStartDate: new Date("2024-01-15"),
        status: ProjectStatus.IN_PROGRESS,
        overallCompletion: 0.67,
        phases: [],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
      };

      // Calculate schedule health
      const scheduleHealth: ScheduleHealth = {
        status: "healthy",
        scheduleVariance: 0.05,
        criticalPathStatus: "on_track",
        riskFactors: [],
        recommendations: [],
      };

      const scheduleData: ProjectSchedule = {
        project: mockProject,
        timeline: {
          start: mockProject.plannedStartDate,
          end: mockProject.plannedEndDate,
          totalDays: Math.ceil(
            (mockProject.plannedEndDate.getTime() -
              mockProject.plannedStartDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        },
        milestones: [],
        health: scheduleHealth,
      };

      setSchedule(scheduleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refreshSchedule = useCallback(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  useEffect(() => {
    // Fetch-on-mount: fetchScheduleData sets loading state before its first
    // await (imperative side-effect, not derived state) — cannot cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScheduleData();
  }, [fetchScheduleData]);

  return {
    schedule,
    loading,
    error,
    refreshSchedule,
  };
};
