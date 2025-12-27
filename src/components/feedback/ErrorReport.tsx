import React, { useState } from "react";
import { EnhancedError } from "@utils/errorHandler";

interface ErrorReportProps {
  error: EnhancedError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

const ErrorReport: React.FC<ErrorReportProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const getSeverityColor = (severity: EnhancedError["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-800";
      case "high":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getTypeIcon = (type: EnhancedError["type"]) => {
    switch (type) {
      case "network":
        return "🌐";
      case "api":
        return "🔌";
      case "auth":
        return "🔐";
      case "validation":
        return "📝";
      case "runtime":
        return "⚙️";
      default:
        return "❗";
    }
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 ${getSeverityColor(error.severity)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{getTypeIcon(error.type)}</span>
          <div>
            <h3 className="font-semibold text-lg">{error.userMessage}</h3>
            <p className="text-sm opacity-75 mt-1">
              Error Type:{" "}
              {error.type.charAt(0).toUpperCase() + error.type.slice(1)}•
              Severity:{" "}
              {error.severity.charAt(0).toUpperCase() + error.severity.slice(1)}
              {error.isRetryable && " • Retryable"}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestions */}
      {error.suggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">What you can try:</h4>
          <ul className="space-y-1">
            {error.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {error.isRetryable && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Try Again
          </button>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>

        {error.context?.component && (
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
          >
            Refresh Page
          </button>
        )}
      </div>

      {/* Technical Details (Collapsible) */}
      {isExpanded && (
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded border">
          <h4 className="font-medium mb-2">Technical Details:</h4>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <strong>Error ID:</strong> {error.id}
            </div>
            <div>
              <strong>Timestamp:</strong>{" "}
              {new Date(error.timestamp).toLocaleString()}
            </div>
            {error.context?.component && (
              <div>
                <strong>Component:</strong> {error.context.component}
              </div>
            )}
            {error.context?.action && (
              <div>
                <strong>Action:</strong> {error.context.action}
              </div>
            )}
            {error.context?.projectId && (
              <div>
                <strong>Project ID:</strong> {error.context.projectId}
              </div>
            )}
            <div>
              <strong>Technical Message:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {error.message}
              </pre>
            </div>
            {error.context?.url && (
              <div>
                <strong>URL:</strong> {error.context.url}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorReport;
