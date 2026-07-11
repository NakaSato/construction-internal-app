import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";

interface ServerErrorProps {
  error?: string;
  errorCode?: number;
  onRetry?: () => void;
}

export default function ServerError({
  error = "Internal Server Error",
  errorCode = 500,
  onRetry,
}: ServerErrorProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [errorId] = useState(
    () => `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
  const [errorTime] = useState(() => new Date().toLocaleString());

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 500 Icon */}
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100 mb-8">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Text */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">{errorCode}</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Server Error
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {error === "Internal Server Error"
              ? "Something went wrong on our end. Our team has been notified and is working to fix the issue."
              : error}
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <button
              onClick={handleGoHome}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {isAuthenticated ? "Go to Dashboard" : "Go to Home"}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              If this problem persists, please contact support.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Error ID: {errorId}</p>
              <p className="text-xs text-gray-400">Time: {errorTime}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
