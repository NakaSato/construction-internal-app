import React, { useState, useCallback } from "react";
import { useProjectStatusWorkflow } from "../../shared/hooks/useProjectManagement";
import {
  ProjectStatus,
  UpdateProjectStatusRequest,
  ProjectStatusHistoryEntry,
} from "../../shared/types/project";

interface ProjectStatusManagerProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onStatusUpdated?: (newStatus: ProjectStatus) => void;
  className?: string;
}

const ProjectStatusManager: React.FC<ProjectStatusManagerProps> = ({
  projectId,
  currentStatus,
  onStatusUpdated,
  className = "",
}) => {
  const { workflow, loading, error, updateStatus } =
    useProjectStatusWorkflow(projectId);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [notifyStakeholders, setNotifyStakeholders] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = useCallback((newStatus: ProjectStatus) => {
    setSelectedStatus(newStatus);
    setShowModal(true);
    setReason("");
  }, []);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!selectedStatus || !reason.trim()) return;

    setUpdating(true);
    try {
      const updateRequest: UpdateProjectStatusRequest = {
        status: selectedStatus,
        reason: reason.trim(),
        effectiveDate: new Date().toISOString(),
        notifyStakeholders,
      };

      const result = await updateStatus(updateRequest);
      if (result) {
        setShowModal(false);
        setSelectedStatus(null);
        setReason("");
        onStatusUpdated?.(selectedStatus);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  }, [
    selectedStatus,
    reason,
    notifyStakeholders,
    updateStatus,
    onStatusUpdated,
  ]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case ProjectStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case ProjectStatus.ON_HOLD:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case ProjectStatus.COMPLETED:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case ProjectStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "📋";
      case ProjectStatus.IN_PROGRESS:
        return "🚀";
      case ProjectStatus.ON_HOLD:
        return "⏸️";
      case ProjectStatus.COMPLETED:
        return "✅";
      case ProjectStatus.CANCELLED:
        return "❌";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-500">Loading workflow...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>Error: {error}</div>
    );
  }

  return (
    <div className={className}>
      {/* Current Status Display */}
      <div className="flex items-center space-x-3">
        <div
          className={`
          inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
          ${getStatusColor(currentStatus)}
        `}
        >
          <span className="mr-2">{getStatusIcon(currentStatus)}</span>
          {currentStatus}
        </div>

        {/* Status Actions */}
        {workflow?.allowedTransitions &&
          workflow.allowedTransitions.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) =>
                  e.target.value &&
                  handleStatusChange(e.target.value as ProjectStatus)
                }
                value=""
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Change Status...</option>
                {workflow.allowedTransitions.map((status: ProjectStatus) => (
                  <option key={status} value={status}>
                    {getStatusIcon(status)} {status}
                  </option>
                ))}
              </select>
            </div>
          )}
      </div>

      {/* Status History */}
      {workflow?.statusHistory && workflow.statusHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Status History
          </h4>
          <div className="space-y-2">
            {workflow.statusHistory
              .slice(0, 3)
              .map((entry: ProjectStatusHistoryEntry, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded p-2"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getStatusColor(
                        entry.status as ProjectStatus
                      )}`}
                    >
                      {getStatusIcon(entry.status as ProjectStatus)}{" "}
                      {entry.status}
                    </span>
                    <span>{entry.changedBy.fullName}</span>
                  </div>
                  <div className="text-right">
                    <div>{new Date(entry.changedAt).toLocaleDateString()}</div>
                    {entry.duration && (
                      <div className="text-gray-500">{entry.duration} days</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Approval Requirements */}
      {workflow?.requiresApproval && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
          ⚠️ Status changes require {workflow.approvalLevel} approval
        </div>
      )}

      {/* Status Change Modal */}
      {showModal && selectedStatus && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Status to {selectedStatus}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for change *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you're changing the status..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifyStakeholders}
                    onChange={(e) => setNotifyStakeholders(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Notify stakeholders
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  disabled={updating || !reason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusManager;
