import { useState, useEffect, useCallback } from "react";

export interface ProjectKPIs {
  schedulePerformanceIndex: number;
  onTimeDeliveryRate: number;
  resourceUtilization: number;
  qualityScore: number;
  completionForecast: Date;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface ProgressTrends {
  dates: string[];
  plannedProgress: number[];
  actualProgress: number[];
  variance: number[];
}

export interface AnalyticsData {
  summary?: {
    onTimeDeliveryRate: number;
    averageCompletion: number;
    totalProjects: number;
  };
  performanceMetrics?: {
    actualProgress: number;
    plannedProgress: number;
    scheduleVariance: number;
    costVariance: number;
  };
}

export const useProgressKPIs = (projectId: string) => {
  const [kpis, setKpis] = useState<ProjectKPIs | null>(null);
  const [trends, setTrends] = useState<ProgressTrends | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateKPIs = useCallback((analytics: AnalyticsData): ProjectKPIs => {
    const performanceMetrics = analytics.performanceMetrics;
    const summary = analytics.summary;

    const schedulePerformanceIndex = performanceMetrics
      ? performanceMetrics.actualProgress /
        Math.max(performanceMetrics.plannedProgress, 1)
      : 0.95;

    const onTimeDeliveryRate = summary?.onTimeDeliveryRate || 89;
    const resourceUtilization = 78; // Mock value
    const qualityScore = 92; // Mock value

    // Calculate completion forecast based on current performance
    const currentDate = new Date();
    const daysToAdd =
      schedulePerformanceIndex < 1.0
        ? Math.round(30 / schedulePerformanceIndex) // Extend timeline if behind
        : 25; // On track

    const completionForecast = new Date(
      currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );

    // Assess risk level
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (schedulePerformanceIndex < 0.8 || onTimeDeliveryRate < 70) {
      riskLevel = "critical";
    } else if (schedulePerformanceIndex < 0.9 || onTimeDeliveryRate < 85) {
      riskLevel = "high";
    } else if (schedulePerformanceIndex < 0.95 || onTimeDeliveryRate < 95) {
      riskLevel = "medium";
    }

    return {
      schedulePerformanceIndex,
      onTimeDeliveryRate,
      resourceUtilization,
      qualityScore,
      completionForecast,
      riskLevel,
    };
  }, []);

  const generateMockTrends = useCallback((): ProgressTrends => {
    const dates = [];
    const plannedProgress = [];
    const actualProgress = [];
    const variance = [];

    const startDate = new Date("2024-01-01");

    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      dates.push(date.toISOString().split("T")[0]);

      const planned = Math.min(100, (i + 1) * 8.33); // Linear progress
      const actual = Math.min(100, planned * (0.9 + Math.random() * 0.2)); // Some variance

      plannedProgress.push(Math.round(planned));
      actualProgress.push(Math.round(actual));
      variance.push(Math.round(actual - planned));
    }

    return { dates, plannedProgress, actualProgress, variance };
  }, []);

  const fetchKPIs = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate API calls
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock analytics data
      const mockAnalytics: AnalyticsData = {
        summary: {
          onTimeDeliveryRate: 89,
          averageCompletion: 67,
          totalProjects: 1,
        },
        performanceMetrics: {
          actualProgress: 67,
          plannedProgress: 75,
          scheduleVariance: -8,
          costVariance: 2,
        },
      };

      setAnalytics(mockAnalytics);

      // Calculate KPIs
      const calculatedKPIs = calculateKPIs(mockAnalytics);
      setKpis(calculatedKPIs);

      // Generate trends data
      const trendsData = generateMockTrends();
      setTrends(trendsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch KPIs");
    } finally {
      setLoading(false);
    }
  }, [projectId, calculateKPIs, generateMockTrends]);

  const refreshKPIs = useCallback(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  useEffect(() => {
    // fetchKPIs sets loading:true synchronously before its first await — intended
    // fetch-loading indicator, not derived state; cannot cascade/loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchKPIs();

    // Refresh KPIs every 5 minutes
    const interval = setInterval(fetchKPIs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchKPIs]);

  return {
    kpis,
    trends,
    analytics,
    loading,
    error,
    refreshKPIs,
  };
};
