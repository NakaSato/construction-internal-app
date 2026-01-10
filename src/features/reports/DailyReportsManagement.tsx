import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  BarChart3,
  Sparkles,
  LineChart
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Alert,
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Pagination,
  Chip,
  LinearProgress,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from "@mui/material";
import { X as CloseIcon, Download, CheckCircle, XCircle } from "lucide-react";
import {
  useDailyReports,
  useDailyReportAnalytics,
  useDailyReportBulkOperations,
  useRole,
  useAuth,
} from "../../shared/hooks";
import {
  DailyReportApprovalStatus,
  GetDailyReportsParams,
} from "../../shared/types/project";
import { EnhancedAnalyticsLoader } from "../../components";
import PredictiveAnalytics from "./components/PredictiveAnalytics";
import InteractiveCharts from "./components/InteractiveCharts";
import DailyReportForm from "./DailyReportForm";

interface DailyReportsManagementProps {
  projectId?: string;
  userId?: string;
  showAnalytics?: boolean;
}

const DailyReportsManagement: React.FC<DailyReportsManagementProps> = ({
  projectId,
  userId,
  showAnalytics = true,
}) => {
  const { isAdmin, isManager } = useRole();
  const { user } = useAuth(); // Get user from useAuth directly
  const currentUserId = user?.userId;

  // Permissions
  const canApprove = isAdmin || isManager;
  const canDelete = isAdmin || isManager;
  const canModify = (reportUserId: string) => isAdmin || isManager || reportUserId === currentUserId;
  const canCreate = true; // All project members can create reports
  const [selectedTab, setSelectedTab] = useState<
    "reports" | "analytics" | "predictive" | "charts" | "templates"
  >("reports");
  const [filters, setFilters] = useState<GetDailyReportsParams>({
    projectId,
    userId,
    pageNumber: 1,
    pageSize: 10,
  });
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Hooks
  const {
    reports,
    loading,
    error,
    pagination,
    realTimeUpdates,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    approveReport,
    rejectReport,
    submitForApproval,
    clearError,
    clearUpdates,
  } = useDailyReports(projectId);

  const { analytics, fetchAnalytics } = useDailyReportAnalytics(
    projectId || ""
  );

  const { bulkApprove, bulkReject, exportReports } =
    useDailyReportBulkOperations();

  // Fetch reports when filters change
  useEffect(() => {
    fetchReports(filters);
  }, [filters, fetchReports]);

  // Fetch analytics when tab changes
  useEffect(() => {
    if (selectedTab === "analytics" && projectId) {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      fetchAnalytics(startDate, endDate);
    }
  }, [selectedTab, projectId, fetchAnalytics]);

  // Memoized filtered reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report) => {
      if (
        filters.approvalStatus &&
        report.approvalStatus !== filters.approvalStatus
      ) {
        return false;
      }
      if (
        filters.hasCriticalIssues !== undefined &&
        report.hasCriticalIssues !== filters.hasCriticalIssues
      ) {
        return false;
      }
      return true;
    });
  }, [reports, filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof GetDailyReportsParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  // Handle report selection
  const handleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((report) => report.id));
    }
  };

  // Handle bulk operations
  const handleBulkApprove = async () => {
    if (selectedReports.length === 0) return;

    const result = await bulkApprove({
      reportIds: selectedReports,
      comments: "Bulk approval",
    });

    if (result) {
      setSelectedReports([]);
      fetchReports(filters);
    }
  };

  const handleBulkReject = async () => {
    if (selectedReports.length === 0) return;

    const reason = prompt("Please provide a rejection reason:");
    if (!reason) return;

    const result = await bulkReject({
      reportIds: selectedReports,
      rejectionReason: reason,
    });

    if (result) {
      setSelectedReports([]);
      fetchReports(filters);
    }
  };

  const handleExport = async () => {
    const result = await exportReports({
      projectId,
      startDate:
        filters.startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      endDate: filters.endDate || new Date().toISOString().split("T")[0],
      format: "excel",
      includeAttachments: true,
      includeAnalytics: true,
    });

    if (result) {
      // Create download link
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading && !reports.length) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyCenter: "center", minHeight: 256 }}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1280px", mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: "text.primary" }}>
              Daily Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track daily work reports
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {canApprove && (
              <>
                <Button
                  onClick={handleExport}
                  variant="outlined"
                  startIcon={<Download size={18} />}
                >
                  Export
                </Button>
                {selectedReports.length > 0 && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={handleBulkApprove}
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle size={18} />}
                    >
                      Approve ({selectedReports.length})
                    </Button>
                    <Button
                      onClick={handleBulkReject}
                      variant="contained"
                      color="error"
                      startIcon={<XCircle size={18} />}
                    >
                      Reject
                    </Button>
                  </Stack>
                )}
              </>
            )}
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="contained"
              sx={{ fontWeight: "bold" }}
              startIcon={<FileText size={18} />}
            >
              Create Report
            </Button>
          </Stack>
        </Stack>

        {/* Real-time updates notification */}
        {realTimeUpdates.length > 0 && (
          <Alert
            severity="info"
            sx={{ mt: 3 }}
            action={
              <Button color="inherit" size="small" onClick={clearUpdates}>
                Clear
              </Button>
            }
          >
            {realTimeUpdates.length} new update(s) received
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="daily reports tabs"
        >
          <Tab
            icon={<FileText size={18} />}
            iconPosition="start"
            label="Reports"
            value="reports"
          />
          {showAnalytics && (
            <Tab
              icon={<BarChart3 size={18} />}
              iconPosition="start"
              label="Analytics"
              value="analytics"
            />
          )}
          {showAnalytics && analytics && (
            <Tab
              icon={<Sparkles size={18} />}
              iconPosition="start"
              label="Predictive AI"
              value="predictive"
            />
          )}
          {showAnalytics && analytics && (
            <Tab
              icon={<LineChart size={18} />}
              iconPosition="start"
              label="Interactive Charts"
              value="charts"
            />
          )}
        </Tabs>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Tab Content */}
      {selectedTab === "reports" && (
        <Stack spacing={4}>
          {/* Filters */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Filters
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Approval Status</InputLabel>
                <Select
                  value={filters.approvalStatus || ""}
                  label="Approval Status"
                  onChange={(e) =>
                    handleFilterChange(
                      "approvalStatus",
                      e.target.value || undefined
                    )
                  }
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={DailyReportApprovalStatus.DRAFT}>Draft</MenuItem>
                  <MenuItem value={DailyReportApprovalStatus.SUBMITTED}>Submitted</MenuItem>
                  <MenuItem value={DailyReportApprovalStatus.APPROVED}>Approved</MenuItem>
                  <MenuItem value={DailyReportApprovalStatus.REJECTED}>Rejected</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Paper>

          {/* Reports Table */}
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Daily Reports ({pagination?.totalCount || 0})
              </Typography>
              {canApprove && reports.length > 0 && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    size="small"
                    checked={
                      selectedReports.length === filteredReports.length &&
                      filteredReports.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Select All
                  </Typography>
                </Stack>
              )}
            </Box>

            {filteredReports.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography color="text.secondary">No daily reports found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      {canApprove && <TableCell sx={{ fontWeight: 600 }}>Select</TableCell>}
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reporter</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Safety</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Quality</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} hover>
                        {canApprove && (
                          <TableCell sx={{ py: 1 }}>
                            <Checkbox
                              size="small"
                              checked={selectedReports.includes(report.id)}
                              onChange={() => handleSelectReport(report.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ py: 1 }}>
                          {new Date(report.reportDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>{report.userName}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip
                            label={report.approvalStatus.replace(/([A-Z])/g, " $1").trim()}
                            size="small"
                            color={
                              report.approvalStatus === DailyReportApprovalStatus.APPROVED ? "success" :
                                report.approvalStatus === DailyReportApprovalStatus.REJECTED ? "error" :
                                  report.approvalStatus === DailyReportApprovalStatus.SUBMITTED ? "warning" : "default"
                            }
                            variant="outlined"
                            sx={{ fontWeight: 600, textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>{report.hoursWorked}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" sx={{ minWidth: 40 }}>{report.safetyScore}/10</Typography>
                            <Box sx={{ width: 64 }}>
                              <LinearProgress
                                variant="determinate"
                                value={report.safetyScore * 10}
                                color={report.safetyScore > 7 ? "success" : report.safetyScore > 4 ? "warning" : "error"}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" sx={{ minWidth: 40 }}>{report.qualityScore}/10</Typography>
                            <Box sx={{ width: 64 }}>
                              <LinearProgress
                                variant="determinate"
                                value={report.qualityScore * 10}
                                color={report.qualityScore > 7 ? "success" : report.qualityScore > 4 ? "warning" : "error"}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 1 }} align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" onClick={() => {/* TODO: View report */ }}>View</Button>
                            {canModify(report.userId) && report.approvalStatus === DailyReportApprovalStatus.DRAFT && (
                              <Button size="small" color="primary" onClick={() => {/* TODO: Edit report */ }}>Edit</Button>
                            )}
                            {canApprove && report.approvalStatus === DailyReportApprovalStatus.SUBMITTED && (
                              <>
                                <Button size="small" color="success" onClick={() => approveReport(report.id)}>Approve</Button>
                                <Button size="small" color="error" onClick={() => {
                                  const reason = prompt("Rejection reason:");
                                  if (reason) rejectReport(report.id, reason);
                                }}>Reject</Button>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Box sx={{ p: 2, display: "flex", justifyContent: "center", borderTop: 1, borderColor: "divider" }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.pageNumber}
                  onChange={(_, page) => handlePageChange(page)}
                  color="primary"
                  variant="outlined"
                  shape="rounded"
                />
              </Box>
            )}
          </Paper>
        </Stack>
      )}

      {/* Analytics Tab */}
      {selectedTab === "analytics" && analytics && (
        <EnhancedAnalyticsLoader
          analytics={analytics}
          projectId={projectId || ""}
        />
      )}

      {/* Predictive Analytics Tab */}
      {selectedTab === "predictive" && analytics && (
        <PredictiveAnalytics
          analytics={analytics}
          projectId={projectId || ""}
          onInsightAction={(action, data) => {
            console.log("Insight action:", action, data);
            // TODO: Implement insight actions like applying resource recommendations
          }}
        />
      )}

      {/* Interactive Charts Tab */}
      {selectedTab === "charts" && analytics && (
        <InteractiveCharts analytics={analytics} projectId={projectId || ""} />
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="lg"
        fullWidth
        disableEnforceFocus // adding this to prevent potential focus fighting with third party libraries if any
      >
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{/* Title handled in form, or can be moved here */}Create/Edit Report</span>
          <IconButton
            aria-label="close"
            onClick={() => setShowCreateModal(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DailyReportForm
            projectId={projectId || ""}
            onSave={() => {
              setShowCreateModal(false);
              fetchReports(filters);
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DailyReportsManagement;
