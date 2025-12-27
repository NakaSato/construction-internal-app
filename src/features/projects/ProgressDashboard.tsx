import React, { useState, useEffect } from "react";
import {
  ProjectEntity,
  ProgressCalculation,
  PhaseCompletion,
  ProjectHealth,
  ActivityStatus,
} from "../../shared/types/project-management";
import { ProgressCalculationEngine } from "../../shared/utils/progressCalculation";

interface ProgressDashboardProps {
  project: ProjectEntity;
  onUpdateProgress?: (activityId: string, percentComplete: number) => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  project,
  onUpdateProgress,
}) => {
  const [progressReport, setProgressReport] =
    useState<ProgressCalculation | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  useEffect(() => {
    const report = ProgressCalculationEngine.generateProgressReport(project);
    setProgressReport(report);
  }, [project]);

  if (!progressReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getHealthStatusColor = (status: ProjectHealth["status"]) => {
    switch (status) {
      case "healthy":
        return "text-blue-600 bg-blue-100";
      case "at_risk":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getActivityStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.COMPLETED:
        return "bg-blue-500";
      case ActivityStatus.IN_PROGRESS:
        return "bg-blue-500";
      case ActivityStatus.OVERDUE:
        return "bg-red-500";
      case ActivityStatus.BLOCKED:
        return "bg-orange-500";
      default:
        return "bg-gray-300";
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-8">
      {/* Overall Progress Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{project.projectName}</h2>
            <p className="text-blue-100 text-lg">
              {project.projectOwner} • {project.mainContractor}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-2">
              {formatPercentage(progressReport.overallCompletion)}
            </div>
            <div className="text-blue-100">Overall Progress</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-blue-100 mb-2">
            <span>Project Completion</span>
            <span>
              Updated: {progressReport.calculatedAt.toLocaleDateString()}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4">
            <div
              className="bg-white rounded-full h-4 transition-all duration-500 ease-out"
              style={{ width: `${progressReport.overallCompletion * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Project Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              📊 Project Health Overview
            </h3>

            <div className="flex items-center mb-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getHealthStatusColor(
                  progressReport.projectHealth.status
                )}`}
              >
                {progressReport.projectHealth.status.toUpperCase()}
              </span>
              <span className="ml-4 text-gray-600">
                Schedule Variance:{" "}
                {progressReport.projectHealth.scheduleVariance > 0 ? "+" : ""}
                {progressReport.projectHealth.scheduleVariance.toFixed(1)} days
              </span>
            </div>

            {progressReport.projectHealth.riskFactors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-600 mb-2">
                  ⚠️ Risk Factors:
                </h4>
                <ul className="space-y-1">
                  {progressReport.projectHealth.riskFactors.map(
                    (risk, index) => (
                      <li
                        key={index}
                        className="text-sm text-red-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        {risk}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {progressReport.projectHealth.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">
                  💡 Recommendations:
                </h4>
                <ul className="space-y-1">
                  {progressReport.projectHealth.recommendations.map(
                    (rec, index) => (
                      <li
                        key={index}
                        className="text-sm text-blue-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {rec}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎯 Critical Path</h3>
          {progressReport.criticalPath.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                {progressReport.criticalPath.length} activities on critical path
              </p>
              {progressReport.criticalPath.slice(0, 5).map((activityId) => {
                const activity = project.phases
                  .flatMap((p) => p.activities)
                  .find((a) => a.activityId === activityId);

                return activity ? (
                  <div
                    key={activityId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate mr-2">
                      {activity.activityName}
                    </span>
                    <span className="text-red-600 font-medium">
                      {formatPercentage(activity.percentComplete)}
                    </span>
                  </div>
                ) : null;
              })}
              {progressReport.criticalPath.length > 5 && (
                <p className="text-xs text-gray-500">
                  +{progressReport.criticalPath.length - 5} more activities
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No critical path calculated</p>
          )}
        </div>
      </div>

      {/* Phase Progress Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6">📈 Phase Progress Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {progressReport.phaseCompletions.map((phaseCompletion) => (
            <div
              key={phaseCompletion.phaseId}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedPhase === phaseCompletion.phaseId
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() =>
                setSelectedPhase(
                  selectedPhase === phaseCompletion.phaseId
                    ? null
                    : phaseCompletion.phaseId
                )
              }
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">
                  {phaseCompletion.phaseName}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    phaseCompletion.onSchedule
                      ? "bg-blue-100 text-blue-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {phaseCompletion.onSchedule ? "On Track" : "Behind"}
                </span>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{formatPercentage(phaseCompletion.completion)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phaseCompletion.completion * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <div>Weight: {formatPercentage(phaseCompletion.weight)}</div>
                <div>
                  Contribution:{" "}
                  {formatPercentage(phaseCompletion.contributionToOverall)}
                </div>
                {!phaseCompletion.onSchedule && (
                  <div className="text-red-600 font-medium">
                    {Math.abs(phaseCompletion.daysAhead)} days{" "}
                    {phaseCompletion.daysAhead < 0 ? "behind" : "ahead"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Phase Activities */}
        {selectedPhase && (
          <div className="border-t pt-6">
            {(() => {
              const phase = project.phases.find(
                (p) => p.phaseId === selectedPhase
              );
              if (!phase) return null;

              return (
                <div>
                  <h4 className="font-semibold mb-4">
                    {phase.phaseName} - Activities
                  </h4>
                  <div className="space-y-3">
                    {phase.activities.map((activity) => (
                      <div
                        key={activity.activityId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 ${getActivityStatusColor(
                                activity.status
                              )}`}
                            />
                            <span className="font-medium">
                              {activity.activityName}
                            </span>
                            {activity.isOnCriticalPath && (
                              <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                Critical
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Duration: {activity.duration} days</span>
                            <span>
                              Start: {activity.startDate.toLocaleDateString()}
                            </span>
                            <span>
                              End: {activity.endDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatPercentage(activity.percentComplete)}
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  activity.status === ActivityStatus.COMPLETED
                                    ? "bg-blue-500"
                                    : activity.status === ActivityStatus.OVERDUE
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                                style={{
                                  width: `${activity.percentComplete * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          {onUpdateProgress &&
                            activity.status !== ActivityStatus.COMPLETED && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={activity.percentComplete * 100}
                                  onChange={(e) =>
                                    onUpdateProgress(
                                      activity.activityId,
                                      Number(e.target.value) / 100
                                    )
                                  }
                                  className="w-20"
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
