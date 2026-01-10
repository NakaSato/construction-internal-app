// This file exports utility functions that provide helper methods for the application.

export * from "./apiClient";
export * from "./authService";
export * from "./projectHelpers";
export * from "./projectsApi";
export * from "./reportService";
export * from "./simpleReportsService";
export * from "./progressCalculation";
export * from "./solarProjectTemplate";
export * from "./masterPlanApi";
export * from "./debugHelper";

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
