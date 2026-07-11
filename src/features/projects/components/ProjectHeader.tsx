import React from "react";
import { useNavigate } from "react-router-dom";
import { ProjectDto } from "../../../shared/types/project";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Paper,
  Collapse,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  FilePlus,
  Search,
  BookOpen,
  MoreHorizontal,
  FolderDot,
  CalendarClock,
} from "lucide-react";

interface ProjectHeaderProps {
  project: ProjectDto;
  refreshing: boolean;
  onRefresh: () => void;
  onRefreshPerformance: () => void;
  onStatusUpdate: (status: string) => void;
  onDelete: () => void;
  onCreateTemplate: () => void;
  onAdvancedSearch: () => void;
  statusUpdating: boolean;
  loadingPerformance: boolean;
  showAdvancedActions: boolean;
  onToggleAdvancedActions: () => void;
  isAdmin: boolean;
  isManager: boolean;
}

const ProjectHeader = ({
  project,
  onCreateTemplate,
  onAdvancedSearch,
  showAdvancedActions,
}: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Helper to get chip color prop based on status
  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in progress":
        return "primary";
      case "completed":
        return "success";
      case "planning":
        return "warning";
      case "cancelled":
        return "error";
      case "on hold":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
              <Typography variant="h4" color="text.primary" sx={{ fontWeight: "bold" }}>
                {project.projectName || "Unnamed Project"}
              </Typography>
              <Chip
                label={project.status || "Unknown"}
                color={getStatusColor(project.status || "")}
                size="small"
                sx={{ fontWeight: 600, height: 24 }}
              />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", color: "text.secondary" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>ID:</Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{project.projectId}</Typography>
              </Box>
              {project.startDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarClock size={14} />
                  <Typography variant="body2">
                    Started {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* You could add global project actions here if needed */}
      </Stack>

      {/* Advanced Actions Panel */}
      <Collapse in={showAdvancedActions}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            borderStyle: "dashed",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
            <MoreHorizontal size={20} className="text-gray-500" />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
              Advanced Actions
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2 }}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<FilePlus size={18} />}
              onClick={onCreateTemplate}
            >
              Create Template
            </Button>
            <Button
              variant="outlined"
              color="info"
              startIcon={<Search size={18} />}
              onClick={onAdvancedSearch}
            >
              Advanced Search
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<BookOpen size={18} />}
              onClick={() =>
                window.open(
                  `http://localhost:5001/api/v1/projects/${project.projectId}/performance`,
                  "_blank"
                )
              }
            >
              API Docs
            </Button>
          </Stack>
        </Paper>
      </Collapse>
    </Box>
  );
};
export default ProjectHeader;
