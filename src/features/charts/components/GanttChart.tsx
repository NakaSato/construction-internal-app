import React from "react";
import { BarChart3 } from "lucide-react";

interface GanttChartProps {
  projects: any[];
  onTaskUpdate?: (taskId: string, updates: any) => void;
  className?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({
  projects,
  className = "",
}) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-600" /> Project Timeline (Gantt Chart)
      </h3>
      <div className="space-y-4">
        {projects.slice(0, 5).map((project, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-48 text-sm font-medium text-gray-700 truncate">
              {project.name || project.projectName || `Project ${index + 1}`}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
              <div
                className="bg-blue-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{
                  width: `${Math.min(project.progress || 0, 100)}%`,
                  minWidth: project.progress > 0 ? "2rem" : "0",
                }}
              >
                {project.progress > 15 && `${project.progress || 0}%`}
              </div>
              {project.progress <= 15 && project.progress > 0 && (
                <span className="absolute left-full ml-2 text-xs font-medium text-gray-600">
                  {project.progress}%
                </span>
              )}
            </div>
            <div className="w-24 text-xs text-gray-500">
              {project.status || "Active"}
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No projects to display in timeline
          </div>
        )}
      </div>
      <div className="mt-6 text-xs text-gray-400">
        * Simplified timeline view. Full Gantt chart functionality coming soon.
      </div>
    </div>
  );
};

export default GanttChart;
