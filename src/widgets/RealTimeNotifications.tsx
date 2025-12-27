import React, { useState, useEffect } from "react";
import { useRealTimeProjects } from "../shared/hooks/useProjectManagement";
import {
  ProjectUpdateNotification,
  RealTimeProjectUpdate,
} from "../shared/types/project";

interface RealTimeNotificationsProps {
  maxNotifications?: number;
  showTimestamp?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  autoHideAfter?: number; // milliseconds
  className?: string;
  enableRealTime?: boolean; // New prop to control real-time updates
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({
  maxNotifications = 5,
  showTimestamp = true,
  position = "top-right",
  autoHideAfter = 5000,
  className = "",
  enableRealTime = false, // Default to false to prevent 404 errors
}) => {
  // Always call the hook but pass a disabled flag
  const { updates, connected } = useRealTimeProjects(undefined, enableRealTime);
  const [notifications, setNotifications] = useState<
    ProjectUpdateNotification[]
  >([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Convert real-time updates to notifications
  useEffect(() => {
    const newNotifications = updates.map(
      (update: RealTimeProjectUpdate): ProjectUpdateNotification => ({
        type: `PROJECT_${update.updateType.toUpperCase()}` as ProjectUpdateNotification["type"],
        projectId: update.projectId,
        projectName: update.data.projectName || "Unknown Project",
        updatedBy: {
          userId: update.metadata.updatedBy,
          fullName: update.metadata.updatedBy, // Will be enhanced with user service
        },
        timestamp: update.metadata.timestamp,
        changes: update.data,
      })
    );

    setNotifications((prev) => {
      const combined = [...prev, ...newNotifications];
      return combined.slice(-maxNotifications);
    });
  }, [updates, maxNotifications]);

  // Auto-hide notifications after specified time
  useEffect(() => {
    if (autoHideAfter > 0 && notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, autoHideAfter);

      return () => clearTimeout(timer);
    }
  }, [notifications, autoHideAfter]);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const getNotificationIcon = (type: ProjectUpdateNotification["type"]) => {
    switch (type) {
      case "PROJECT_CREATED":
        return "🆕";
      case "PROJECT_UPDATED":
        return "📝";
      case "PROJECT_DELETED":
        return "🗑️";
      case "PROJECT_STATUS_CHANGED":
        return "🔄";
      default:
        return "📋";
    }
  };

  const getNotificationColor = (type: ProjectUpdateNotification["type"]) => {
    switch (type) {
      case "PROJECT_CREATED":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "PROJECT_UPDATED":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "PROJECT_DELETED":
        return "bg-red-50 border-red-200 text-red-800";
      case "PROJECT_STATUS_CHANGED":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      <div className="w-80 space-y-2">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-blue-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                Live Updates ({notifications.length})
              </span>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              {isMinimized ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {!isMinimized && (
          <div className="space-y-2">
            {notifications
              .slice(-maxNotifications)
              .map((notification, index) => (
                <div
                  key={`${notification.projectId}-${notification.timestamp}-${index}`}
                  className={`
                  border rounded-lg p-3 shadow-sm transition-all duration-300 ease-out
                  transform hover:scale-105
                  ${getNotificationColor(notification.type)}
                `}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {notification.projectName}
                        </p>
                        {showTimestamp && (
                          <span className="text-xs opacity-75">
                            {new Date(
                              notification.timestamp
                            ).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-75 mt-1">
                        {notification.type
                          .replace("PROJECT_", "")
                          .toLowerCase()
                          .replace("_", " ")}
                        {" by "} {notification.updatedBy.fullName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Clear All Button */}
        {!isMinimized && notifications.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
            <button
              onClick={() => setNotifications([])}
              className="w-full text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeNotifications;
