import React, { useState, useEffect } from "react";
import { XCircle, Plus, Trash2 } from "lucide-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  Alert,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  useDailyReports,
  useDailyReportTemplates,
  useRole,
} from "../../shared/hooks";
import {
  CreateDailyReportRequest,
  DailyReportDto,
  WeatherCondition,
  DailyReportTaskProgress,
  DailyReportMaterialUsage,
} from "../../shared/types/project";

interface DailyReportFormProps {
  projectId: string;
  reportId?: string; // For editing existing reports
  onSave?: (report: DailyReportDto) => void;
  onCancel?: () => void;
}

const DailyReportForm: React.FC<DailyReportFormProps> = ({
  projectId,
  reportId,
  onSave,
  onCancel,
}) => {
  const { isAdmin, isManager } = useRole();
  const { createReport, updateReport, validateReport, error: apiError } =
    useDailyReports(projectId);
  const { templates } = useDailyReportTemplates(projectId);

  const [formData, setFormData] = useState<CreateDailyReportRequest>({
    projectId,
    reportDate: new Date().toISOString().split("T")[0],
    totalWorkHours: 8,
    personnelOnSite: 1,
    weatherCondition: "Sunny",
    temperature: 72,
    humidity: 50,
    workSummary: "",
    workAccomplished: "",
    workPlannedNextDay: "",
    issues: "",
    safetyScore: 10,
    qualityScore: 10,
    dailyProgressContribution: 0,
    additionalNotes: "",
    workProgressItems: [],
    materialUsages: [],
  });

  const [validation, setValidation] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing report for editing
  useEffect(() => {
    if (reportId) {
      // TODO: Load existing report data
    }
  }, [reportId]);

  // Apply template defaults
  useEffect(() => {
    if (templates.length > 0 && !reportId) {
      const defaultTemplate =
        templates.find((t) => t.isDefault) || templates[0];
      if (defaultTemplate) {
        setFormData((prev) => ({
          ...prev,
          ...defaultTemplate.defaultValues,
        }));
      }
    }
  }, [templates, reportId]);

  const handleInputChange = (
    field: keyof CreateDailyReportRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTaskChange = (
    index: number,
    field: keyof DailyReportTaskProgress,
    value: any
  ) => {
    const updatedTasks = [...(formData.workProgressItems || [])];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setFormData((prev) => ({ ...prev, workProgressItems: updatedTasks }));
  };

  const addTask = () => {
    const newTask: DailyReportTaskProgress = {
      taskId: `task-${Date.now()}`,
      title: "",
      completionPercentage: 0,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      workProgressItems: [...(prev.workProgressItems || []), newTask],
    }));
  };

  const removeTask = (index: number) => {
    const updatedTasks =
      formData.workProgressItems?.filter((_, i) => i !== index) || [];
    setFormData((prev) => ({ ...prev, workProgressItems: updatedTasks }));
  };

  const handleMaterialChange = (
    index: number,
    field: keyof DailyReportMaterialUsage,
    value: any
  ) => {
    const updatedMaterials = [...(formData.materialUsages || [])];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    setFormData((prev) => ({ ...prev, materialUsages: updatedMaterials }));
  };

  const addMaterial = () => {
    const newMaterial: DailyReportMaterialUsage = {
      materialId: `material-${Date.now()}`,
      name: "",
      quantity: 0,
      unit: "",
      unitCost: 0,
      totalCost: 0,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      materialUsages: [...(prev.materialUsages || []), newMaterial],
    }));
  };

  const removeMaterial = (index: number) => {
    const updatedMaterials =
      formData.materialUsages?.filter((_, i) => i !== index) || [];
    setFormData((prev) => ({ ...prev, materialUsages: updatedMaterials }));
  };

  const validateForm = async () => {
    const result = await validateReport(formData);
    setValidation(result);

    if (result && !result.isValid) {
      const fieldErrors: Record<string, string> = {};
      result.errors.forEach((error) => {
        fieldErrors[error.field] = error.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Sanitize payload to remove invalid IDs (temporary frontend IDs)
      const sanitizedData = {
        ...formData,
        workProgressItems: formData.workProgressItems?.filter(t =>
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(t.taskId)
        ),
        materialUsages: formData.materialUsages?.filter(m =>
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(m.materialId || "")
        ),
        // Ensure numeric types are valid
        safetyScore: Number(formData.safetyScore) || 10,
        qualityScore: Number(formData.qualityScore) || 10,
        totalWorkHours: Number(formData.totalWorkHours) || 0,
        personnelOnSite: Number(formData.personnelOnSite) || 0
      };

      let result;
      if (reportId) {
        result = await updateReport(reportId, sanitizedData);
      } else {
        result = await createReport(sanitizedData);
      }

      if (result && onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: "bold", color: "text.primary" }}>
          {reportId ? "Edit Daily Report" : "Create Daily Report"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={4}>
            {/* API Error Box */}
            {apiError && (
              <Alert severity="error" icon={<XCircle size={20} />}>
                {apiError}
              </Alert>
            )}

            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Report Date"
                    type="date"
                    value={formData.reportDate}
                    onChange={(e) => handleInputChange("reportDate", e.target.value)}
                    error={!!errors.reportDate}
                    helperText={errors.reportDate}
                    InputLabelProps={{ shrink: true }}
                    required
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Hours Worked"
                    type="number"
                    value={formData.totalWorkHours}
                    onChange={(e) => handleInputChange("totalWorkHours", parseFloat(e.target.value))}
                    error={!!errors.totalWorkHours}
                    helperText={errors.totalWorkHours}
                    inputProps={{ min: 0, max: 24, step: 0.5 }}
                    required
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Personnel on Site"
                    type="number"
                    value={formData.personnelOnSite}
                    onChange={(e) => handleInputChange("personnelOnSite", parseInt(e.target.value))}
                    inputProps={{ min: 1 }}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Daily Progress Contribution"
                    type="number"
                    value={formData.dailyProgressContribution}
                    onChange={(e) => handleInputChange("dailyProgressContribution", parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Weather Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                Weather Conditions
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Weather</InputLabel>
                    <Select
                      value={formData.weatherCondition}
                      label="Weather"
                      onChange={(e) => handleInputChange("weatherCondition", e.target.value)}
                    >
                      {Object.values(WeatherCondition).map((condition) => (
                        <MenuItem key={condition} value={condition}>
                          {condition.replace(/([A-Z])/g, " $1").trim()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Temperature"
                    type="number"
                    value={formData.temperature || ""}
                    onChange={(e) => handleInputChange("temperature", parseFloat(e.target.value) || undefined)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">°F</InputAdornment>,
                    }}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Humidity"
                    type="number"
                    value={formData.humidity || ""}
                    onChange={(e) => handleInputChange("humidity", parseInt(e.target.value) || undefined)}
                    inputProps={{ min: 0, max: 100 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Work Summary */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
                Work Summary
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Daily Summary"
                  multiline
                  rows={2}
                  value={formData.workSummary}
                  onChange={(e) => handleInputChange("workSummary", e.target.value)}
                  placeholder="Brief summary of work completed today..."
                  error={!!errors.workSummary}
                  helperText={errors.workSummary}
                  required
                />
                <TextField
                  fullWidth
                  label="Work Accomplished"
                  multiline
                  rows={2}
                  value={formData.workAccomplished || ""}
                  onChange={(e) => handleInputChange("workAccomplished", e.target.value)}
                  placeholder="Detailed description of work accomplished..."
                />
                <TextField
                  fullWidth
                  label="Work Planned for Next Day"
                  multiline
                  rows={2}
                  value={formData.workPlannedNextDay || ""}
                  onChange={(e) => handleInputChange("workPlannedNextDay", e.target.value)}
                  placeholder="Work planned for tomorrow..."
                />
                <TextField
                  fullWidth
                  label="Issues Encountered"
                  multiline
                  rows={2}
                  value={formData.issues || ""}
                  onChange={(e) => handleInputChange("issues", e.target.value)}
                  placeholder="Any issues, problems, or delays encountered..."
                />
              </Stack>
            </Box>

            <Divider />

            {/* Scores */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                Performance Scores
              </Typography>
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography gutterBottom variant="body2" color="text.secondary">
                    Safety Score: {formData.safetyScore}/10
                  </Typography>
                  <Slider
                    value={formData.safetyScore}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    onChange={(_, value) => handleInputChange("safetyScore", value)}
                    sx={{ color: (formData?.safetyScore ?? 0) > 7 ? "success.main" : (formData?.safetyScore ?? 0) > 4 ? "warning.main" : "error.main" }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography gutterBottom variant="body2" color="text.secondary">
                    Quality Score: {formData.qualityScore}/10
                  </Typography>
                  <Slider
                    value={formData.qualityScore}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    onChange={(_, value) => handleInputChange("qualityScore", value)}
                    sx={{ color: (formData?.qualityScore ?? 0) > 7 ? "success.main" : (formData?.qualityScore ?? 0) > 4 ? "warning.main" : "error.main" }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Tasks Completed */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main" }}>
                  Tasks Completed
                </Typography>
                <Button startIcon={<Plus size={18} />} size="small" variant="outlined" onClick={addTask}>
                  Add Task
                </Button>
              </Box>

              <Stack spacing={2}>
                {formData.workProgressItems?.map((task, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 1 }}>
                    <CardHeader
                      title={`Task ${index + 1}`}
                      titleTypographyProps={{ variant: "body2", fontWeight: 600 }}
                      action={
                        <IconButton size="small" color="error" onClick={() => removeTask(index)}>
                          <Trash2 size={16} />
                        </IconButton>
                      }
                      sx={{ py: 1, px: 2, bgcolor: "grey.50" }}
                    />
                    <CardContent sx={{ pt: 2, pb: "16px !important" }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 8 }}>
                          <TextField
                            fullWidth
                            label="Task Title"
                            value={task.title}
                            onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Completion"
                            type="number"
                            value={task.completionPercentage}
                            onChange={(e) => handleTaskChange(index, "completionPercentage", parseInt(e.target.value))}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                            inputProps={{ min: 0, max: 100 }}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Materials Used */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main" }}>
                  Materials Used
                </Typography>
                <Button startIcon={<Plus size={18} />} size="small" variant="outlined" onClick={addMaterial}>
                  Add Material
                </Button>
              </Box>

              <Stack spacing={2}>
                {formData.materialUsages?.map((material, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 1 }}>
                    <CardHeader
                      title={`Material ${index + 1}`}
                      titleTypographyProps={{ variant: "body2", fontWeight: 600 }}
                      action={
                        <IconButton size="small" color="error" onClick={() => removeMaterial(index)}>
                          <Trash2 size={16} />
                        </IconButton>
                      }
                      sx={{ py: 1, px: 2, bgcolor: "grey.50" }}
                    />
                    <CardContent sx={{ pt: 2, pb: "16px !important" }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Material Name"
                            value={material.name}
                            onChange={(e) => handleMaterialChange(index, "name", e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <TextField
                            fullWidth
                            label="Qty"
                            type="number"
                            value={material.quantity}
                            onChange={(e) => handleMaterialChange(index, "quantity", parseFloat(e.target.value))}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <TextField
                            fullWidth
                            label="Unit"
                            value={material.unit}
                            placeholder="pcs, ft"
                            onChange={(e) => handleMaterialChange(index, "unit", e.target.value)}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Additional Notes */}
            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={2}
              value={formData.additionalNotes || ""}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              placeholder="Any additional notes or observations..."
            />

            {/* Validation Results */}
            {validation && (
              <Stack spacing={2}>
                {validation.warnings.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight="bold">Warnings:</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validation.warnings.map((warning: any, index: number) => (
                        <li key={index}><Typography variant="caption">{warning.message}</Typography></li>
                      ))}
                    </ul>
                  </Alert>
                )}
                {validation.suggestions.length > 0 && (
                  <Alert severity="info">
                    <Typography variant="body2" fontWeight="bold">Suggestions:</Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validation.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}><Typography variant="caption">{suggestion}</Typography></li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </Stack>
            )}

            {/* Form Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              {onCancel && (
                <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{ px: 4, py: 1, fontWeight: "bold" }}
              >
                {isSubmitting ? "Saving..." : reportId ? "Update Report" : "Create Report"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default DailyReportForm;
