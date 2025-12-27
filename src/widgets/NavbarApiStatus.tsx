import React, { useState, useEffect } from "react";
import { apiClient } from "../shared/utils/apiClient";
import { useAuth } from "../shared/hooks/useAuth";

interface NavbarApiStatusProps {
  className?: string;
}

const NavbarApiStatus: React.FC<NavbarApiStatusProps> = ({
  className = "",
}) => {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();

  const checkApiStatus = async () => {
    try {
      setStatus("checking");
      const startTime = Date.now();
      await apiClient.healthCheck();
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setStatus("online");
      setLastCheck(new Date());
    } catch (error) {
      setStatus("offline");
      setResponseTime(null);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30";
      case "offline":
        return "bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30";
      case "checking":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30 hover:bg-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30 hover:bg-gray-500/30";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return "●";
      case "offline":
        return "●";
      case "checking":
        return "⏳";
      default:
        return "●";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "online":
        return "API Online";
      case "offline":
        return "API Offline";
      case "checking":
        return "Checking...";
      default:
        return "Unknown";
    }
  };

  const getTooltip = () => {
    let tooltip = `Backend API Status: ${getStatusText()}`;

    if (status === "online") {
      tooltip += `\n✅ Connection established`;
      if (responseTime) {
        tooltip += `\n⚡ Response time: ${responseTime}ms`;
      }
      if (isAuthenticated) {
        tooltip += `\n🔐 Authenticated session active`;
      }
    } else if (status === "offline") {
      tooltip += `\n❌ Cannot connect to backend`;
      tooltip += `\n🔧 Check if API server is running`;
    }

    if (lastCheck) {
      tooltip += `\n🕒 Last checked: ${lastCheck.toLocaleTimeString()}`;
    }

    return tooltip;
  };

  const handleClick = () => {
    // Manual refresh on click
    checkApiStatus();
  };

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm cursor-pointer transition-all duration-200 ${getStatusColor()} ${className}`}
      title={getTooltip()}
      onClick={handleClick}
    >
      <span className="mr-1.5 text-sm">{getStatusIcon()}</span>
      <span className="hidden md:inline">{getStatusText()}</span>
      {status === "online" && responseTime && (
        <span className="hidden lg:inline ml-1 text-xs opacity-75">
          ({responseTime}ms)
        </span>
      )}
    </div>
  );
};

export default NavbarApiStatus;
