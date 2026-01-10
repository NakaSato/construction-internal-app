import { useState, useCallback } from "react";
import { projectsApi } from "../../../shared/utils/projectsApi";

export const useProjectPerformance = () => {
  const [performance, setPerformance] = useState<any>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  const fetchPerformance = useCallback(async (projectId?: string) => {
    if (!projectId) return;

    try {
      setLoadingPerformance(true);

      // Use real API for performance data
      const performanceData = await projectsApi.getProjectPerformance(
        projectId
      );

      setPerformance(performanceData);
      console.log(
        `✅ [ProjectDetail] Performance data loaded:`,
        performanceData
      );
    } catch (err: any) {
      // Silently handle 404 - the performance endpoint may not exist
      // Only log non-404 errors for debugging
      if (err?.message && !err.message.includes('not found')) {
        console.warn(`[ProjectDetail] Performance API unavailable:`, err.message);
      }
      // Set performance to null when API fails
      setPerformance(null);
    } finally {
      setLoadingPerformance(false);
    }
  }, []);

  return {
    performance,
    loadingPerformance,
    fetchPerformance,
  };
};
