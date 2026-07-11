import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Paper,
    Typography,
    Stack,
    Button,
    IconButton,
    Chip,
    Tooltip,
    useTheme,
    alpha,
    CircularProgress,
} from "@mui/material";
import {
    Plus,
    CheckCircle2,
    Flag,
    AlertCircle,
    Trash2,
} from "lucide-react";
import { ProjectDto, ProjectMilestone, CreateProjectMilestoneRequest } from "@shared/types/project";
import { projectsApi } from "@shared/api";
import MilestoneDialog from "./MilestoneDialog";

interface MilestoneManagerProps {
    project: ProjectDto;
    onMilestoneChange?: () => void;
}

const MilestoneManager = ({ project, onMilestoneChange }: MilestoneManagerProps) => {
    const theme = useTheme();
    const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchMilestones = useCallback(async () => {
        try {
            setLoading(true);
            const data = await projectsApi.getProjectMilestones(project.projectId);
            setMilestones(data);
        } catch (error) {
            console.error("Failed to fetch milestones", error);
        } finally {
            setLoading(false);
        }
    }, [project.projectId]);

    useEffect(() => {
        fetchMilestones();
    }, [fetchMilestones]);

    const handleAddMilestone = async (data: { milestoneName: string; description?: string; targetDate: string }) => {
        try {
            const request: CreateProjectMilestoneRequest = {
                name: data.milestoneName,
                description: data.description,
                dueDate: data.targetDate,
                priority: 1 // Default Medium
            };

            const newMilestone = await projectsApi.addMilestone(project.projectId, request);
            if (newMilestone) {
                await fetchMilestones();
                onMilestoneChange?.();
                setDialogOpen(false);
            }
        } catch (error) {
            console.error("Failed to add milestone", error);
        }
    };

    const handleCompleteMilestone = async (milestone: ProjectMilestone) => {
        try {
            await projectsApi.updateMilestone(project.projectId, milestone.milestoneId, {
                name: milestone.title,
                description: "", // Might need proper description access or separate endpoint
                dueDate: milestone.targetDate,
                priority: 1, // Default Medium
                status: "Completed",
                actualDate: new Date().toISOString()
            });
            await fetchMilestones();
            onMilestoneChange?.();
        } catch (error) {
            console.error("Failed to complete milestone", error);
        }
    };

    const handleDeleteMilestone = async (id: string) => {
        try {
            if (confirm("Are you sure you want to delete this milestone?")) {
                await projectsApi.deleteMilestone(project.projectId, id);
                await fetchMilestones();
                onMilestoneChange?.();
            }
        } catch (error) {
            console.error("Failed to delete milestone", error);
        }
    };

    const getStatusColor = (milestone: ProjectMilestone) => {
        if (milestone.status === "Completed") return "success";
        const targetDate = new Date(milestone.targetDate);
        const today = new Date();
        if (targetDate < today) return "error";
        if (targetDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return "warning";
        return "primary";
    };

    const getStatusIcon = (milestone: ProjectMilestone) => {
        if (milestone.status === "Completed") return CheckCircle2;
        const targetDate = new Date(milestone.targetDate);
        if (targetDate < new Date()) return AlertCircle;
        return Flag;
    };

    const completedCount = milestones.filter(m => m.status === "Completed").length;
    const sortedMilestones = [...milestones].sort((a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );

    return (
        <Box>
            {/* Header with Add Button */}
            <Stack direction="row" sx={{ mb: 2, alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Project Milestones
                    </Typography>
                    {milestones.length > 0 && (
                        <Chip
                            label={`${completedCount}/${milestones.length}`}
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: "0.65rem" }}
                        />
                    )}
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Plus size={16} />}
                        onClick={() => setDialogOpen(true)}
                        sx={{ textTransform: "none" }}
                    >
                        Add Milestone
                    </Button>
                </Stack>
            </Stack>

            {/* Loading State */}
            {loading && milestones.length === 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {/* Empty State */}
            {!loading && milestones.length === 0 && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderStyle: "dashed",
                        borderRadius: 2,
                    }}
                >
                    <Flag size={32} color={theme.palette.text.disabled} style={{ marginBottom: 8 }} />
                    <Typography variant="body2" color="text.secondary">
                        No milestones defined yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Add milestones to track project progress
                    </Typography>
                </Paper>
            )}

            {/* Milestones List */}
            {milestones.length > 0 && (
                <Box sx={{ position: "relative" }}>
                    {/* Timeline line */}
                    <Box
                        sx={{
                            position: "absolute",
                            left: 15,
                            top: 20,
                            bottom: 20,
                            width: 2,
                            bgcolor: "divider",
                        }}
                    />

                    <Stack spacing={2.5}>
                        {sortedMilestones.map((milestone) => {
                            const Icon = getStatusIcon(milestone);
                            const statusColor = getStatusColor(milestone);
                            const targetDate = new Date(milestone.targetDate);
                            const isCompleted = milestone.status === "Completed";
                            const isOverdue = !isCompleted && targetDate < new Date();

                            return (
                                <Stack
                                    key={milestone.milestoneId}
                                    direction="row"
                                    spacing={2}
                                    sx={{ alignItems: "flex-start" }}
                                >
                                    {/* Timeline dot */}
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            bgcolor: theme.palette[statusColor].main,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            zIndex: 1,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={16} color="white" />
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ flex: 1, pt: 0.5 }}>
                                        <Stack
                                            direction="row"
                                            sx={{
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "medium",
                                                    textDecoration: isCompleted ? "line-through" : "none",
                                                    color: isCompleted ? "text.secondary" : "text.primary",
                                                }}
                                            >
                                                {milestone.title}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {isCompleted
                                                        ? `Completed: ${new Date(milestone.actualDate || milestone.targetDate).toLocaleDateString()}`
                                                        : `Target: ${targetDate.toLocaleDateString()}`}
                                                </Typography>
                                                <Chip
                                                    label={isCompleted ? "Completed" : isOverdue ? "Overdue" : "Pending"}
                                                    size="small"
                                                    color={statusColor}
                                                    sx={{ height: 20, fontSize: "0.65rem" }}
                                                />
                                                {!isCompleted && (
                                                    <Tooltip title="Mark as complete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleCompleteMilestone(milestone)}
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                "&:hover": {
                                                                    bgcolor: alpha(theme.palette.success.main, 0.2),
                                                                },
                                                            }}
                                                        >
                                                            <CheckCircle2 size={14} color={theme.palette.success.main} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete Milestone">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteMilestone(milestone.milestoneId)}
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s',
                                                            '.MuiStack-root:hover &': {
                                                                opacity: 1
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={14} color={theme.palette.error.main} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                    </Box>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {/* Add Milestone Dialog */}
            <MilestoneDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleAddMilestone}
            />
        </Box>
    );
};

export default MilestoneManager;
