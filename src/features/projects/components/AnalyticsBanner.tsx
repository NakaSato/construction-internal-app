import React from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Skeleton
} from "@mui/material";
import {
  BarChart3,
  Folder,
  Activity,
  CheckCircle2,
  Zap,
  LayoutGrid,
  Users,
  DollarSign,
  FileText,
  PauseCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";

interface AnalyticsBannerProps {
  analytics: any;
  project: any;
  loading?: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  loading?: boolean;
}

const StatCard = ({ label, value, icon, color, subtext, loading }: StatCardProps) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={40} />
        </Box>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.01)} 100%)`,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

const AnalyticsBanner = ({ analytics, project, loading = false }: AnalyticsBannerProps) => {
  const theme = useTheme();

  // Primary stats config
  const mainStats = [
    {
      label: "Total Projects",
      value: analytics?.totalProjects?.toLocaleString() || "0",
      icon: <Folder size={20} />,
      color: theme.palette.primary.main,
    },
    {
      label: "Active Projects",
      value: analytics?.activeProjects?.toLocaleString() || "0",
      icon: <Activity size={20} />,
      color: theme.palette.info.main,
    },
    {
      label: "Completed",
      value: analytics?.completedProjects?.toLocaleString() || "0",
      icon: <CheckCircle2 size={20} />,
      color: theme.palette.success.main,
    },
    {
      label: "Total Capacity",
      value: `${analytics?.totalCapacityKw?.toLocaleString() || "0"}kW`,
      icon: <Zap size={20} />,
      color: "#8b5cf6", // Violet
    },
    {
      label: "Est. Revenue",
      value: `$${(analytics?.totalRevenueValue / 1000000 || 0).toFixed(1)}M`,
      icon: <DollarSign size={20} />,
      color: "#10b981", // Emerald
    },
  ];

  // Secondary/Detailed stats could go in a smaller strip or expanded view
  const secondaryStats = [
    {
      label: "Planning",
      value: analytics?.planningProjects?.toLocaleString() || "0",
      icon: <FileText size={16} />,
      color: theme.palette.warning.main,
    },
    {
      label: "On Hold",
      value: analytics?.onHoldProjects?.toLocaleString() || "0",
      icon: <PauseCircle size={16} />,
      color: theme.palette.warning.dark,
    },
    {
      label: "Cancelled",
      value: analytics?.cancelledProjects?.toLocaleString() || "0",
      icon: <XCircle size={16} />,
      color: theme.palette.error.main,
    },
    {
      label: "Managers",
      value: analytics?.projectManagerCount?.toLocaleString() || "0",
      icon: <Users size={16} />,
      color: theme.palette.secondary.main,
    },
  ];

  if (!analytics && !loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderColor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5, color: "primary.main" }}>
          <BarChart3 size={24} />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
          Analytics Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Unable to load analytics data. Please refresh or try again later.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: 2 }}>
        {/* Main Stats Row */}
        {mainStats.map((stat, index) => (
          <Box key={index}>
            <StatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              loading={loading}
            />
          </Box>
        ))}
      </Box>

      {/* Secondary Stats Row - Smaller and more compact */}
      <Box sx={{ mt: 2 }}>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: "background.paper",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 2
          }}
        >
          {loading ? (
            // Loading skeletons for secondary stats
            Array(4).fill(0).map((_, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={60} />
              </Box>
            ))
          ) : (
            secondaryStats.map((stat, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 0.5,
                }}
              >
                <Box sx={{ color: stat.color, display: "flex", alignItems: "center" }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h6" component="span" fontWeight="bold" sx={{ mr: 1, lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
};
export default AnalyticsBanner;
