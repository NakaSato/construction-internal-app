import { useState, useEffect, useCallback, useRef } from "react";
import { solarProjectApi } from "../api/solarProjectApiRefactored";
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
  DailyReportApprovalStatus,
} from "../types/project";
import { ApiResponse, EnhancedPagedResult } from "../types/api";
import { useAuth } from "./useAuth";

/**
 * Comprehensive hook for daily reports management with real-time updates
 */
export const useDailyReports = (projectId?: string) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState<
    DailyReportUpdateNotification[]
  >([]);
  const lastUpdateRef = useRef<string>(new Date().toISOString());

  // Fetch daily reports with filters
  const fetchReports = useCallback(
    async (params?: GetDailyReportsParams) => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = projectId ? { ...params, projectId } : params;
        // Convert to the format expected by the API
        const apiParams = searchParams
          ? {
            ProjectId: searchParams.projectId,
            ReporterId: searchParams.userId,
            Status: searchParams.approvalStatus,
            ReportDateAfter: searchParams.startDate,
            ReportDateBefore: searchParams.endDate,
            WeatherCondition: searchParams.weatherCondition,
            HasCriticalIssues: searchParams.hasCriticalIssues,
            PageNumber: searchParams.pageNumber,
            PageSize: searchParams.pageSize,
            SortBy: searchParams.sortBy,
            SortOrder: searchParams.sortDirection,
          }
          : undefined;

        // Filter out undefined values
        const cleanParams = apiParams
          ? Object.fromEntries(
            Object.entries(apiParams).filter(([_, v]) => v !== undefined)
          )
          : undefined;

        const response = await solarProjectApi.dailyReports.getDailyReports(
          cleanParams
        );

        if (response.success && response.data) {
          setReports(response.data.items || []);
          setPagination({
            totalCount: response.data.totalCount,
            pageNumber: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
            hasPreviousPage: response.data.hasPreviousPage,
            hasNextPage: response.data.hasNextPage,
          });
        } else {
          setError(response.message || "Failed to fetch daily reports");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch daily reports"
        );
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );
  // Get single daily report by ID
  const getReport = useCallback(async (id: string): Promise<DailyReportDto | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await solarProjectApi.dailyReports.getDailyReport(id);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to fetch daily report");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch daily report"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  // Initial load
  useEffect(() => {
    // fetchReports sets loading:true synchronously before its first await — intended
    // fetch-loading indicator, not derived state; cannot cascade/loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, [fetchReports]);

  // Real-time updates polling
  useEffect(() => {
    if (!projectId) return;

    const pollForUpdates = async () => {
      try {
        const response =
          await solarProjectApi.dailyReports.getDailyReportUpdates(
            projectId,
            lastUpdateRef.current
          );

        if (response.success && response.data && response.data.length > 0) {
          setRealTimeUpdates((prev) =>
            [...response.data!, ...prev].slice(0, 50)
          ); // Keep last 50 updates
          lastUpdateRef.current = new Date().toISOString();

          // Refresh reports if there are updates
          await fetchReports();
        }
      } catch (err) {
        console.warn("Failed to fetch real-time updates:", err);
      }
    };

    const interval = setInterval(pollForUpdates, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [projectId, fetchReports]);

  // Create daily report
  const createReport = async (
    reportData: CreateDailyReportRequest
  ): Promise<DailyReportDto | null> => {
    try {
      setError(null);
      const response = await solarProjectApi.dailyReports.createDailyReport(
        reportData
      );

      if (response.success && response.data) {
        await fetchReports();
        return response.data;
      } else {
        setError(response.message || "Failed to create daily report");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create daily report"
      );
      return null;
    }
  };

  // Update daily report
  const updateReport = async (
    id: string,
    reportData: UpdateDailyReportRequest
  ): Promise<DailyReportDto | null> => {
    try {
      setError(null);
      const response = await solarProjectApi.dailyReports.updateDailyReport(
        id,
        reportData
      );

      if (response.success && response.data) {
        setReports((prev) =>
          prev.map((report) => (report.id === id ? response.data! : report))
        );
        return response.data;
      } else {
        setError(response.message || "Failed to update daily report");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update daily report"
      );
      return null;
    }
  };

  // Delete daily report
  const deleteReport = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await solarProjectApi.dailyReports.deleteDailyReport(id);

      if (response.success) {
        setReports((prev) => prev.filter((report) => report.id !== id));
        return true;
      } else {
        setError(response.message || "Failed to delete daily report");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete daily report"
      );
      return false;
    }
  };

  // Approve daily report
  const approveReport = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await solarProjectApi.dailyReports.approveDailyReport(
        id
      );

      if (response.success && response.data) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === id
              ? {
                ...report,
                approvalStatus: DailyReportApprovalStatus.APPROVED,
              }
              : report
          )
        );
        return true;
      } else {
        setError(response.message || "Failed to approve daily report");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve daily report"
      );
      return false;
    }
  };

  // Reject daily report
  const rejectReport = async (
    id: string,
    rejectionReason: string
  ): Promise<boolean> => {
    try {
      setError(null);
      const response = await solarProjectApi.dailyReports.rejectDailyReport(
        id,
        rejectionReason
      );

      if (response.success && response.data) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === id
              ? {
                ...report,
                approvalStatus: DailyReportApprovalStatus.REJECTED,
              }
              : report
          )
        );
        return true;
      } else {
        setError(response.message || "Failed to reject daily report");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject daily report"
      );
      return false;
    }
  };

  // Submit for approval
  const submitForApproval = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response =
        await solarProjectApi.dailyReports.submitDailyReportForApproval(id);

      if (response.success && response.data) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === id
              ? {
                ...report,
                approvalStatus: DailyReportApprovalStatus.SUBMITTED,
              }
              : report
          )
        );
        return true;
      } else {
        setError(response.message || "Failed to submit for approval");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit for approval"
      );
      return false;
    }
  };

  // Validate daily report
  const validateReport = async (
    reportData: CreateDailyReportRequest
  ): Promise<DailyReportValidationResult | null> => {
    try {
      setError(null);
      const response = await solarProjectApi.dailyReports.validateDailyReport(
        reportData
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to validate daily report");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate daily report"
      );
      return null;
    }
  };

  return {
    // State
    reports,
    loading,
    error,
    pagination,
    realTimeUpdates,

    // Actions
    fetchReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    approveReport,
    rejectReport,
    submitForApproval,
    validateReport,

    // Utility
    refresh: fetchReports,
    clearError: () => setError(null),
    clearUpdates: () => setRealTimeUpdates([]),
  };
};

/**
 * Hook for daily report analytics
 */
export const useDailyReportAnalytics = (projectId: string) => {
  const [analytics, setAnalytics] = useState<DailyReportAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await solarProjectApi.dailyReports.getDailyReportAnalytics(
            projectId,
            startDate,
            endDate
          );

        if (response.success && response.data) {
          setAnalytics(response.data);
        } else {
          setError(response.message || "Failed to fetch analytics");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics"
        );
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    clearError: () => setError(null),
  };
};

/**
 * Hook for daily report templates
 */
export const useDailyReportTemplates = (projectId?: string) => {
  const [templates, setTemplates] = useState<DailyReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await solarProjectApi.dailyReports.getDailyReportTemplates(projectId);

      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        setError(response.message || "Failed to fetch templates");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch templates"
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // fetchTemplates sets loading:true synchronously before its first await — intended
    // fetch-loading indicator, not derived state; cannot cascade/loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (
    templateData: Partial<DailyReportTemplate>
  ): Promise<DailyReportTemplate | null> => {
    try {
      setError(null);
      const response =
        await solarProjectApi.dailyReports.createDailyReportTemplate(
          templateData
        );

      if (response.success && response.data) {
        setTemplates((prev) => [...prev, response.data!]);
        return response.data;
      } else {
        setError(response.message || "Failed to create template");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create template"
      );
      return null;
    }
  };

  const updateTemplate = async (
    id: string,
    templateData: Partial<DailyReportTemplate>
  ): Promise<DailyReportTemplate | null> => {
    try {
      setError(null);
      const response =
        await solarProjectApi.dailyReports.updateDailyReportTemplate(
          id,
          templateData
        );

      if (response.success && response.data) {
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === id ? response.data! : template
          )
        );
        return response.data;
      } else {
        setError(response.message || "Failed to update template");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update template"
      );
      return null;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response =
        await solarProjectApi.dailyReports.deleteDailyReportTemplate(id);

      if (response.success) {
        setTemplates((prev) => prev.filter((template) => template.id !== id));
        return true;
      } else {
        setError(response.message || "Failed to delete template");
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete template"
      );
      return false;
    }
  };

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    clearError: () => setError(null),
  };
};

/**
 * Hook for bulk operations on daily reports
 */
export const useDailyReportBulkOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkApprove = async (
    request: BulkApprovalRequest
  ): Promise<BulkOperationResult | null> => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await solarProjectApi.dailyReports.bulkApproveDailyReports(request);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to bulk approve reports");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk approve reports"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const bulkReject = async (
    request: BulkRejectionRequest
  ): Promise<BulkOperationResult | null> => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await solarProjectApi.dailyReports.bulkRejectDailyReports(request);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to bulk reject reports");
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk reject reports"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportReports = async (
    request: DailyReportExportRequest
  ): Promise<{ downloadUrl: string; fileName: string } | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await solarProjectApi.dailyReports.exportDailyReports(
        request
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to export reports");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export reports");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    bulkApprove,
    bulkReject,
    exportReports,
    clearError: () => setError(null),
  };
};
