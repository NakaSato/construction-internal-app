import React, { useState } from "react";
import { ProjectDto } from "../../../shared/types/project";
import { formatCurrency } from "../utils/projectHelpers";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Collapse,
  IconButton,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ChevronDown,
  ChevronUp,
  User,
  DollarSign,
  Cpu,
  Info,
  MapPin,
} from "lucide-react";

interface ProjectSidebarProps {
  project: ProjectDto;
}

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleCard = ({
  title,
  icon,
  summary,
  children,
  defaultExpanded = false,
}: CollapsibleCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header - Always visible */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.palette.primary.main,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                {summary}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" sx={{ pointerEvents: "none" }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </Stack>
      </Box>

      {/* Expandable Content */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};

const ProjectSidebar = ({ project }: ProjectSidebarProps) => {
  const theme = useTheme();

  return (
    <Stack spacing={2}>
      {/* Project Manager */}
      <CollapsibleCard
        title="Project Manager"
        icon={<User size={16} />}
        summary={project.projectManager?.fullName || "Not assigned"}
      >
        {project.projectManager ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              {project.projectManager.fullName?.charAt(0) || "?"}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {project.projectManager.fullName || "Unknown"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {project.projectManager.email || "No email"}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No manager assigned to this project
          </Typography>
        )}
      </CollapsibleCard>

      {/* Financial Information */}
      <CollapsibleCard
        title="Financial"
        icon={<DollarSign size={16} />}
        summary={
          project.revenueValue
            ? formatCurrency(project.revenueValue)
            : "View details"
        }
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Revenue Value
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {project.revenueValue !== null && project.revenueValue !== 0
                ? formatCurrency(project.revenueValue)
                : project.totalCapacityKw
                  ? formatCurrency(project.totalCapacityKw * 5000) + " (est.)"
                  : "Not specified"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              FTS Value
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {project.ftsValue !== null && project.ftsValue !== 0
                ? formatCurrency(project.ftsValue)
                : "Not specified"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              PQM Value
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {project.pqmValue !== null && project.pqmValue !== 0
                ? formatCurrency(project.pqmValue)
                : "Not specified"}
            </Typography>
          </Box>
        </Stack>
      </CollapsibleCard>

      {/* Technical Details */}
      <CollapsibleCard
        title="Technical"
        icon={<Cpu size={16} />}
        summary={
          project.totalCapacityKw
            ? `${project.totalCapacityKw} kW`
            : "View details"
        }
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Connection Type
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {project.connectionType || "Not specified"}
              </Typography>
              {project.connectionType === "MV" && (
                <Chip
                  label="Medium Voltage"
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: "0.65rem" }}
                />
              )}
            </Stack>
          </Box>
          {project.connectionNotes && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Connection Notes
              </Typography>
              <Typography variant="body2">
                {project.connectionNotes}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Capacity
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {project.totalCapacityKw
                ? `${project.totalCapacityKw} kW`
                : "Not specified"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              PV Modules
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {project.pvModuleCount || "Not specified"}
              {project.pvModuleCount && project.totalCapacityKw && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (~{((project.totalCapacityKw / project.pvModuleCount) * 1000).toFixed(0)}W each)
                </Typography>
              )}
            </Typography>
          </Box>
        </Stack>
      </CollapsibleCard>

      {/* Project Info */}
      <CollapsibleCard
        title="Project Info"
        icon={<Info size={16} />}
        summary={project.status || "View details"}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Team Assignment
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {project.team || "Not assigned"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Current Status
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {project.status || "Unknown"}
            </Typography>
          </Box>
          {project.estimatedEndDate && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Estimated End Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {new Date(project.estimatedEndDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>
      </CollapsibleCard>

      {/* Location Information */}
      {project.locationCoordinates && (
        <CollapsibleCard
          title="Location"
          icon={<MapPin size={16} />}
          summary={project.address ? "Has address" : "View coordinates"}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Coordinates
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                {project.locationCoordinates.latitude.toFixed(6)},{" "}
                {project.locationCoordinates.longitude.toFixed(6)}
              </Typography>
            </Box>
            {project.address && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body2">
                  {project.address}
                </Typography>
              </Box>
            )}
          </Stack>
        </CollapsibleCard>
      )}
    </Stack>
  );
};

export default ProjectSidebar;
