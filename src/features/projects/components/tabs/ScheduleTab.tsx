import React, { useState } from "react";
import { ProjectDto } from "@shared/types/project";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    Chip,
    LinearProgress,
    Grid,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useTheme,
    alpha,
} from "@mui/material";
import {
    BarChart3,
    TrendingUp,
    CheckCircle2,
    Plus,
    Edit,
    Trash2,
    Calendar,
    Clock,
} from "lucide-react";

interface ScheduleTabProps {
    project: ProjectDto;
    timelineData: any[];
    progressPercentage: number;
    totalDays: number;
    daysElapsed: number;
}

const ScheduleTab = ({
    project,
    timelineData,
    progressPercentage,
    totalDays,
    daysElapsed,
}: ScheduleTabProps) => {
    const theme = useTheme();
    const [scheduleView, setScheduleView] = useState<
        "overview" | "gantt" | "tasks"
    >("overview");

    const startDate = new Date(project.startDate);
    const endDate = project.estimatedEndDate
        ? new Date(project.estimatedEndDate)
        : new Date();

    const handleViewChange = (
        _event: React.MouseEvent<HTMLElement>,
        newView: "overview" | "gantt" | "tasks" | null
    ) => {
        if (newView !== null) {
            setScheduleView(newView);
        }
    };

    const getStatusChipColor = (status: string): "success" | "primary" | "default" => {
        switch (status) {
            case "completed":
                return "success";
            case "in-progress":
                return "primary";
            default:
                return "default";
        }
    };

    return (
        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            {/* Schedule Header */}
            <Box sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                            <TrendingUp size={20} color={theme.palette.primary.main} />
                            <Typography component="h2" variant="h6" sx={{ fontWeight: "bold" }}>
                                Project Schedule
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            Manage project timeline, tasks, and milestones
                        </Typography>
                    </Box>
                </Stack>

                {/* Schedule View Tabs */}
                <ToggleButtonGroup
                    value={scheduleView}
                    exclusive
                    onChange={handleViewChange}
                    size="small"
                    sx={{ mt: 2.5 }}
                >
                    <ToggleButton value="overview" sx={{ textTransform: "none", px: 2 }}>
                        <BarChart3 size={16} style={{ marginRight: 6 }} />
                        Overview
                    </ToggleButton>
                    <ToggleButton value="gantt" sx={{ textTransform: "none", px: 2 }}>
                        <TrendingUp size={16} style={{ marginRight: 6 }} />
                        Timeline
                    </ToggleButton>
                    <ToggleButton value="tasks" sx={{ textTransform: "none", px: 2 }}>
                        <CheckCircle2 size={16} style={{ marginRight: 6 }} />
                        Tasks
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Schedule Content */}
            <Box sx={{ p: 3 }}>
                {scheduleView === "overview" && (
                    <Stack spacing={3}>
                        {/* Project Stats */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    }}
                                >
                                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: "medium" }}>
                                        Progress
                                    </Typography>
                                    <Typography variant="h4" color="primary.dark" sx={{ fontWeight: "bold" }}>
                                        {progressPercentage}%
                                    </Typography>
                                    <Typography variant="caption" color="primary.main">
                                        {project.completedTaskCount} of {project.taskCount} tasks
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    }}
                                >
                                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: "medium" }}>
                                        Start Date
                                    </Typography>
                                    <Typography variant="h6" color="primary.dark" sx={{ fontWeight: "bold" }}>
                                        {startDate.toLocaleDateString()}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        borderColor: alpha(theme.palette.warning.main, 0.3),
                                        bgcolor: alpha(theme.palette.warning.main, 0.04),
                                    }}
                                >
                                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: "medium" }}>
                                        Target End
                                    </Typography>
                                    <Typography variant="h6" color="warning.dark" sx={{ fontWeight: "bold" }}>
                                        {endDate.toLocaleDateString()}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        borderColor: alpha(theme.palette.secondary.main, 0.3),
                                        bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                    }}
                                >
                                    <Typography variant="caption" color="secondary.main" sx={{ fontWeight: "medium" }}>
                                        Duration
                                    </Typography>
                                    <Typography variant="h6" color="secondary.dark" sx={{ fontWeight: "bold" }}>
                                        {totalDays} days
                                    </Typography>
                                    <Typography variant="caption" color="secondary.main">
                                        {daysElapsed} elapsed
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Progress Timeline */}
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 3 }}>
                                Project Phases
                            </Typography>
                            <Stack spacing={3}>
                                {timelineData.map((phase, index) => (
                                    <Box key={index}>
                                        <Stack
                                            direction="row"
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                                {phase.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <Calendar size={14} color={theme.palette.text.secondary} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {phase.startDate.toLocaleDateString()} -{" "}
                                                    {phase.endDate.toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={phase.progress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                mb: 1,
                                            }}
                                        />
                                        <Stack
                                            direction="row"
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Chip
                                                label={phase.status.replace("-", " ")}
                                                size="small"
                                                color={getStatusChipColor(phase.status)}
                                                sx={{ textTransform: "capitalize", height: 22, fontSize: "0.7rem" }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {phase.progress}% complete
                                            </Typography>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Stack>
                )}

                {scheduleView === "gantt" && (
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: 1, borderColor: "divider" }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: "medium" }}>
                                Project Timeline
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={0.5} sx={{ mb: 2 }}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <Grid size={1} key={i}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            align="center"
                                            sx={{ display: "block" }}
                                        >
                                            W{i + 1}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                            <Stack spacing={1.5}>
                                {timelineData.map((phase, index) => (
                                    <Grid container spacing={0.5} key={index} sx={{ alignItems: "center" }}>
                                        <Grid size={3}>
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{ fontWeight: "medium" }}
                                            >
                                                {phase.name}
                                            </Typography>
                                        </Grid>
                                        <Grid size={9}>
                                            <Box sx={{ position: "relative" }}>
                                                <Box
                                                    sx={{
                                                        height: 32,
                                                        bgcolor: "grey.100",
                                                        borderRadius: 1,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            height: "100%",
                                                            width: `${(phase.duration / 75) * 100}%`,
                                                            bgcolor: phase.status === "completed"
                                                                ? "success.main"
                                                                : phase.status === "in-progress"
                                                                    ? "primary.main"
                                                                    : "grey.400",
                                                            borderRadius: 1,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            px: 1,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                height: "100%",
                                                                width: `${phase.progress}%`,
                                                                bgcolor: "rgba(255,255,255,0.3)",
                                                                borderRadius: 0.5,
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        position: "absolute",
                                                        left: 8,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        color: "white",
                                                        fontWeight: "medium",
                                                    }}
                                                >
                                                    {phase.duration}d
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Stack>
                        </Box>
                    </Paper>
                )}

                {scheduleView === "tasks" && (
                    <Stack spacing={2}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                Task Management
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                onClick={() => console.log("Create task")}
                            >
                                Add Task
                            </Button>
                        </Stack>

                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "grey.50" }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Task Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {project.taskCount > 0 ? (
                                        Array.from(
                                            { length: Math.min(project.taskCount, 5) },
                                            (_, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                                            Task {i + 1} -{" "}
                                                            {timelineData[i % timelineData.length]?.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={
                                                                i < project.completedTaskCount
                                                                    ? "Completed"
                                                                    : "In Progress"
                                                            }
                                                            size="small"
                                                            color={
                                                                i < project.completedTaskCount
                                                                    ? "success"
                                                                    : "warning"
                                                            }
                                                            sx={{ height: 22, fontSize: "0.7rem" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {project.projectManager?.fullName || "Unassigned"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                                                            <Clock size={14} color={theme.palette.text.secondary} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {new Date(
                                                                    Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000
                                                                ).toLocaleDateString()}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                                                            <IconButton size="small" color="primary">
                                                                <Edit size={16} />
                                                            </IconButton>
                                                            <IconButton size="small" color="error">
                                                                <Trash2 size={16} />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No tasks available. Click "Add Task" to create the first task.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}
            </Box>
        </Paper>
    );
};

export default ScheduleTab;
