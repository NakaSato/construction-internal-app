import React from "react";

interface ErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

const ErrorBanner = ({ error, onDismiss }: ErrorBannerProps) => {
  const isWarning = error.includes("Note:");
  const isAuthError =
    error.includes("Authentication required") || error.includes("401");
  const isServerError =
    error.includes("Server Error") ||
    error.includes("Object reference not set");
  const isNotFound = error.includes("not found") || error.includes("404");

  return (
    <div
      className={`border rounded-lg p-4 ${isWarning
          ? "bg-yellow-50 border-yellow-200"
          : "bg-red-50 border-red-200"
        }`}
    >
      <div className="flex items-center gap-3">
        <svg
          className={`w-5 h-5 ${isWarning ? "text-yellow-500" : "text-red-500"
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div className="flex-1">
          <h4
            className={`font-medium ${isWarning ? "text-yellow-900" : "text-red-900"
              }`}
          >
            {isWarning
              ? "Limited Data Warning"
              : isAuthError
                ? "Authentication Required"
                : isServerError
                  ? "Server Error"
                  : isNotFound
                    ? "Project Not Found"
                    : "API Error"}
          </h4>
          <p
            className={`text-sm ${isWarning ? "text-yellow-700" : "text-red-700"
              }`}
          >
            {error}
          </p>
          {isAuthError && (
            <div className="mt-2">
              <button
                onClick={() => (window.location.href = "/login")}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to Login
              </button>
            </div>
          )}
          {isServerError && (
            <div className="mt-2 space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className={`${isWarning
              ? "text-yellow-500 hover:text-yellow-700"
              : "text-red-500 hover:text-red-700"
            }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;
