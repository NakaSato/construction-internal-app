import React from "react";
import { ProjectDto, ProjectPerformanceDto } from "@shared/types/project";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Chip,
    LinearProgress,
    Grid,
    useTheme,
    alpha,
    Skeleton,
    Divider,
} from "@mui/material";
import {
    Calendar,
    Clock,
    Target,
    CheckCircle2,
} from "lucide-react";
import MilestoneManager from "./MilestoneManager";

interface ProjectTimelinePlanningProps {
    project: ProjectDto;
    performance?: ProjectPerformanceDto | null;
    loadingPerformance?: boolean;
}

const ProjectTimelinePlanning = ({
    project,
    performance,
    loadingPerformance = false
}: ProjectTimelinePlanningProps) => {
    const theme = useTheme();

    const startDate = new Date(project.startDate);
    const endDate = project.estimatedEndDate
        ? new Date(project.estimatedEndDate)
        : new Date();
    const today = new Date();

    // Calculate project progress
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    const taskProgress = project.taskCount > 0
        ? Math.round((project.completedTaskCount / project.taskCount) * 100)
        : 0;

    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

    return (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            {/* Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Calendar size={20} color={theme.palette.primary.main} />
                    <Typography component="h2" variant="h6" fontWeight="bold">
                        Project Timeline & Planning
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Track project progress, milestones, and key dates
                </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
                {/* Progress Overview */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Time Progress */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                height: "100%",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <Clock size={18} color={theme.palette.info.main} />
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Time Progress
                                </Typography>
                            </Stack>
                            <Box sx={{ mb: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {Math.round(timeProgress)}% of timeline elapsed
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {daysRemaining} days remaining
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={timeProgress}
                                    sx={{
                                        height: 10,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                        "& .MuiLinearProgress-bar": {
                                            bgcolor: theme.palette.info.main,
                                        },
                                    }}
                                />
                            </Box>
                            <Stack direction="row" justifyContent="space-between">
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Calendar size={14} color={theme.palette.text.secondary} />
                                    <Typography variant="caption" color="text.secondary">
                                        Start: {startDate.toLocaleDateString()}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Target size={14} color={theme.palette.text.secondary} />
                                    <Typography variant="caption" color="text.secondary">
                                        End: {endDate.toLocaleDateString()}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Task Progress */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                height: "100%",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <CheckCircle2 size={18} color={theme.palette.success.main} />
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Task Completion
                                </Typography>
                            </Stack>
                            <Box sx={{ mb: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {taskProgress}% tasks completed
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {project.completedTaskCount} / {project.taskCount} tasks
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={taskProgress}
                                    color="success"
                                    sx={{
                                        height: 10,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                    }}
                                />
                            </Box>
                            <Stack direction="row" justifyContent="space-between">
                                <Chip
                                    size="small"
                                    label={`${project.completedTaskCount} Completed`}
                                    color="success"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: "0.7rem" }}
                                />
                                <Chip
                                    size="small"
                                    label={`${project.taskCount - project.completedTaskCount} Remaining`}
                                    color="warning"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: "0.7rem" }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Key Metrics */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper
                            sx={{
                                p: 2,
                                textAlign: "center",
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                                {totalDays}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Days
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper
                            sx={{
                                p: 2,
                                textAlign: "center",
                                bgcolor: alpha(theme.palette.success.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="success.main">
                                {totalDays - daysRemaining}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Days Elapsed
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper
                            sx={{
                                p: 2,
                                textAlign: "center",
                                bgcolor: alpha(theme.palette.warning.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="warning.main">
                                {daysRemaining}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Days Left
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper
                            sx={{
                                p: 2,
                                textAlign: "center",
                                bgcolor: alpha(theme.palette.info.main, 0.04),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="info.main">
                                {project.taskCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Tasks
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Milestones Manager */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <MilestoneManager project={project} />
                </Paper>
            </Box>
        </Paper>
    );
};

export default ProjectTimelinePlanning;
