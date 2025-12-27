import { Project } from "../types/project";

export const getStatusColor = (status: Project["status"]): string => {
  switch (status) {
    case "Planning":
      return "bg-gray-100 text-gray-800";
    case "Design":
      return "bg-blue-100 text-blue-800";
    case "Permits":
      return "bg-yellow-100 text-yellow-800";
    case "Construction":
      return "bg-orange-100 text-orange-800";
    case "Inspection":
      return "bg-purple-100 text-purple-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPriorityColor = (priority: Project["priority"]): string => {
  switch (priority) {
    case "Low":
      return "bg-blue-100 text-blue-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Format currency for display
export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format capacity for display
export const formatCapacity = (capacity: number): string => {
  if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(1)} MW`;
  }
  return `${capacity.toFixed(1)} kW`;
};

// Get project completion percentage
export const getProjectCompletionRate = (projects: Project[]): number => {
  if (projects.length === 0) return 0;
  const completedProjects = projects.filter(
    (p) => p.status === "Completed"
  ).length;
  return (completedProjects / projects.length) * 100;
};

// Get projects by status
export const filterProjectsByStatus = (
  projects: Project[],
  status: Project["status"]
): Project[] => {
  return projects.filter((project) => project.status === status);
};

// Get overdue projects (expected completion date passed)
export const getOverdueProjects = (projects: Project[]): Project[] => {
  const today = new Date();
  return projects.filter((project) => {
    const expectedCompletion = new Date(project.expectedCompletion);
    return expectedCompletion < today && project.status !== "Completed";
  });
};

// Get projects within date range
export const getProjectsInDateRange = (
  projects: Project[],
  startDate: Date,
  endDate: Date
): Project[] => {
  return projects.filter((project) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.expectedCompletion);
    return (
      (projectStart >= startDate && projectStart <= endDate) ||
      (projectEnd >= startDate && projectEnd <= endDate) ||
      (projectStart <= startDate && projectEnd >= endDate)
    );
  });
};
