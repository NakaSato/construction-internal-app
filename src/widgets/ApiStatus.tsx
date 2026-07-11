import React, { useState, useEffect } from "react";
import { apiClient } from "../shared/utils/apiClient";
import { CheckCircle2, AlertCircle, Clock, Circle } from "lucide-react";

interface ApiStatusProps {
  className?: string;
}

export default function ApiStatus({ className = "" }: ApiStatusProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    try {
      setStatus("checking");
      await apiClient.healthCheck();
      setStatus("online");
      setLastCheck(new Date());
    } catch (error) {
      setStatus("offline");
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Polling side-effect: checkApiStatus sets status before its first await;
    // intentional imperative status probe, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "offline":
        return "bg-red-100 text-red-800 border-red-200";
      case "checking":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-4 w-4" />;
      case "offline":
        return <AlertCircle className="h-4 w-4" />;
      case "checking":
        return <Clock className="h-4 w-4 animate-spin-slow" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "online":
        return "API Online";
      case "offline":
        return "API Offline";
      case "checking":
        return "Checking API...";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()} ${className}`}
    >
      <span className="mr-2">{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
      {lastCheck && (
        <span className="ml-2 text-xs opacity-75">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
