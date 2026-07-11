import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, useRole } from "@hooks/useAuth";
import ProtectedRoute from "@features/auth/ProtectedRoute";

// MUI Components
import {
  Box,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Skeleton,
  Alert,
  Paper,
  Zoom,
  useTheme
} from "@mui/material";

// Icons
import {
  Home,
  Calendar,
  Settings,
  BarChart3,
  MoreVertical,
  Trash2,
  FileText, // Added FileText
} from "lucide-react";

// Import refactored hooks and components
import {
  useProjectData,
  useProjectAnalytics,
  useProjectPerformance,
  useProjectActions,
} from "@features/projects/hooks";

import {
  ProjectHeader,
  ProjectSidebar,

} from "@features/projects/components";

import { AppShell } from "../../components/layout/AppShell";

import OverviewTab from "@features/projects/components/tabs/OverviewTab";
import ScheduleTab from "@features/projects/components/tabs/ScheduleTab";
import SpecsTab from "@features/projects/components/tabs/SpecsTab";
import PerformanceTab from "@features/projects/components/tabs/PerformanceTab";
import { DailyReportsManagementLoader } from "@features/reports"; // Added Loader

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isManager } = useRole();
  const theme = useTheme();

  // UI State
  const [isPending, startTransition] = useTransition();
  const [showAdvancedActions, setShowAdvancedActions] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const a11yProps = (index: string) => {
    return {
      id: `project-tab-${index}`,
      "aria-controls": `project-tabpanel-${index}`,
    };
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    startTransition(() => {
      setActiveTab(newValue);
    });
  };

  // Handle global sidebar navigation
  const handleGlobalTabChange = (tabId: string) => {
    // Navigate back to the main dashboard/projects list
    // You might want to pass state or query params to select the specific tab on the dashboard
    navigate("/dashboard");
  };

  // Schedule timeline calculation
  const calculateScheduleData = () => {
    if (!project)
      return {
        timelineData: [],
        progressPercentage: 0,
        totalDays: 0,
        daysElapsed: 0,
      };

    const startDate = new Date(project.startDate);
    const endDate = project.estimatedEndDate
      ? new Date(project.estimatedEndDate)
      : new Date();
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.ceil(
      (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const progressPercentage =
      project.taskCount > 0
        ? Math.round((project.completedTaskCount / project.taskCount) * 100)
        : 0;

    const phases = [
      {
        name: "Planning & Design",
        duration: 15,
        status: "completed",
        color: "bg-blue-500",
      },
      {
        name: "Procurement",
        duration: 20,
        status: "in-progress",
        color: "bg-blue-500",
      },
      {
        name: "Installation",
        duration: 30,
        status: "pending",
        color: "bg-gray-400",
      },
      {
        name: "Testing & Commissioning",
        duration: 10,
        status: "pending",
        color: "bg-gray-400",
      },
    ];

    let currentDate = new Date(startDate);
    const timelineData = phases.map((phase) => {
      const phaseStart = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + phase.duration);
      const phaseEnd = new Date(currentDate);

      return {
        ...phase,
        startDate: phaseStart,
        endDate: phaseEnd,
        progress:
          phase.status === "completed"
            ? 100
            : phase.status === "in-progress"
              ? 60
              : 0,
      };
    });

    return { timelineData, progressPercentage, totalDays, daysElapsed };
  };

  // Custom hooks for data management
  const {
    project,
    loading,
    error,
    warning,
    refreshing,
    fetchProject,
    setError,
    setWarning,
  } = useProjectData(projectId);

  const { analytics, fetchAnalytics } = useProjectAnalytics();

  const { performance, loadingPerformance, fetchPerformance } =
    useProjectPerformance();

  // Actions hook
  const {
    statusUpdating,
    handleStatusUpdate,
    handleDelete,
    handleCreateTemplate,
    handleAdvancedSearch,
  } = useProjectActions(
    project,
    projectId,
    user,
    () => fetchProject(true),
    () => fetchPerformance(projectId),
    setError,
    setWarning
  );

  // Effects
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (project) {
      fetchPerformance(projectId);
    }
  }, [project, fetchPerformance, projectId]);

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
          <Container maxWidth="xl">
            {/* Header Skeleton */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Skeleton variant="rounded" width={100} height={32} />
                <Skeleton variant="text" width={200} height={40} />
              </Box>
              <Skeleton variant="rounded" width={200} height={40} />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 4 }}>
              <Box>
                <Skeleton variant="rounded" height={150} sx={{ mb: 3 }} />
                <Skeleton variant="rounded" height={400} />
              </Box>
              <Box>
                <Skeleton variant="rounded" height={600} />
              </Box>
            </Box>

            {/* Loading Indicator */}
            <Box sx={{ position: "fixed", bottom: 32, right: 32, display: "flex", alignItems: "center", gap: 2, bgcolor: "background.paper", p: 2, borderRadius: 2, boxShadow: 3 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">Loading project...</Typography>
            </Box>
          </Container>
        </Box>
      </ProtectedRoute>
    );
  }

  // Error state
  if (!project) {
    return (
      <ProtectedRoute>
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 8, display: "flex", justifyContent: "center" }}>
          <Container maxWidth="md">
            <Paper elevation={0} variant="outlined" sx={{ overflow: "hidden", borderRadius: 3 }}>
              <Box sx={{ bgcolor: "error.lighter", px: 4, py: 3, borderBottom: 1, borderColor: "error.light" }}>
                <Typography variant="h5" color="error.dark" sx={{ fontWeight: "bold" }}>Project Not Found</Typography>
                <Typography variant="body2" color="error.main">ID: {projectId}</Typography>
              </Box>
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {error || "The requested project could not be found. It may have been deleted, moved, or you might not have permission to access it."}
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell
        activeTab="projects"
        onTabChange={handleGlobalTabChange}
        title={project?.projectName || "Project Detail"}
      >
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
          <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <ProjectHeader
                project={project}
                refreshing={refreshing}
                onRefresh={() => fetchProject(true)}
                onRefreshPerformance={() => fetchPerformance(projectId)}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDelete}
                onCreateTemplate={handleCreateTemplate}
                onAdvancedSearch={handleAdvancedSearch}
                statusUpdating={statusUpdating}
                loadingPerformance={loadingPerformance}
                showAdvancedActions={showAdvancedActions}
                onToggleAdvancedActions={() => setShowAdvancedActions(!showAdvancedActions)}
                isAdmin={isAdmin}
                isManager={isManager}
              />
            </Box>



            {/* Tab Navigation */}
            <Paper elevation={0} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 2,
                  "& .MuiTab-root": {
                    minHeight: 64,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  },
                }}
              >
                <Tab icon={<Home size={18} />} iconPosition="start" label="Overview" value="overview" {...a11yProps("overview")} />
                <Tab icon={<Calendar size={18} />} iconPosition="start" label="Schedule & Tasks" value="schedule" {...a11yProps("schedule")} />
                <Tab icon={<Settings size={18} />} iconPosition="start" label="Specifications" value="specs" {...a11yProps("specs")} />
                <Tab icon={<BarChart3 size={18} />} iconPosition="start" label="Performance" value="performance" {...a11yProps("performance")} />
                <Tab icon={<FileText size={18} />} iconPosition="start" label="Daily Reports" value="reports" {...a11yProps("reports")} />
              </Tabs>
            </Paper>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "5fr 1fr" }, gap: 3 }}>
              {/* Main Content */}
              <Box>
                {/* Error and Warning Banners */}
                {(error || warning) && (
                  <Box sx={{ mb: 2 }}>
                    {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>{error}</Alert>}
                    {warning && <Alert severity="warning" onClose={() => setWarning(null)}>{warning}</Alert>}
                  </Box>
                )}

                {/* Tab Content */}
                <Box sx={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  <Suspense fallback={
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                      <CircularProgress />
                    </Box>
                  }>
                    <Box role="tabpanel" hidden={activeTab !== "overview"}>
                      {activeTab === "overview" && <OverviewTab project={project} performance={performance} loadingPerformance={loadingPerformance} />}
                    </Box>
                    <Box role="tabpanel" hidden={activeTab !== "schedule"}>
                      {activeTab === "schedule" && <ScheduleTab project={project} {...calculateScheduleData()} />}
                    </Box>
                    <Box role="tabpanel" hidden={activeTab !== "specs"}>
                      {activeTab === "specs" && <SpecsTab project={project} />}
                    </Box>
                    <Box role="tabpanel" hidden={activeTab !== "performance"}>
                      {activeTab === "performance" && <PerformanceTab project={project} performance={performance} />}
                    </Box>
                    <Box role="tabpanel" hidden={activeTab !== "reports"}>
                      {activeTab === "reports" && <DailyReportsManagementLoader projectId={projectId} showAnalytics={true} />}
                    </Box>
                  </Suspense>
                </Box>
              </Box>

              {/* Sidebar with sticky positioning */}
              <Box>
                <Box sx={{ position: { lg: "sticky" }, top: { lg: 32 } }}>
                  <ProjectSidebar project={project} />
                </Box>
              </Box>
            </Box>

            {/* Loading Indicator for Performance Data */}
            {loadingPerformance && (
              <Box sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 2000 }}>
                <Zoom in={loadingPerformance}>
                  <Paper sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 5 }}>
                    <CircularProgress size={20} />
                    <Typography variant="caption" sx={{ fontWeight: "medium" }}>Updating performance...</Typography>
                  </Paper>
                </Zoom>
              </Box>
            )}


          </Container>
        </Box>
      </AppShell>
    </ProtectedRoute>
  );
};


export default ProjectDetail;
