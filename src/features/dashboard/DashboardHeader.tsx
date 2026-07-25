import React from "react";
import { Calendar, RefreshCw, Plus } from "lucide-react";
import { useAuth } from "../../shared/hooks/useAuth";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  /** Optional refresh handler — hides the refresh button when omitted. */
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** Optional primary action (e.g. "New Project") — hides the button when omitted. */
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  /** Extra controls rendered to the right of the built-in actions. */
  children?: React.ReactNode;
}

const greetingFor = (date: Date): string => {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  onPrimaryAction,
  primaryActionLabel = "New Project",
  children,
}) => {
  const { user } = useAuth();
  const now = new Date();

  const heading =
    title ??
    `${greetingFor(now)}, ${user?.fullName || user?.username || "there"}`;

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: heading + context */}
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold text-gray-800">{heading}</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{subtitle ?? dateLabel}</span>
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {children}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            <span>{primaryActionLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
