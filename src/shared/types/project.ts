export * from "./project/core";
export * from "./project/analytics";
export * from "./project/daily-reports";
export * from "./project/search";
export * from "./project/templates";
export * from "./project/events";

// Support types that were in project.ts but might belong elsewhere
export interface ProjectNotificationSettings {
  statusChanges: boolean;
  milestoneUpdates: boolean;
  teamAssignments: boolean;
  documentUploads: boolean;
  reportSubmissions: boolean;
  realTimeUpdates: boolean;
}

export interface ProjectError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ProjectValidationResult {
  isValid: boolean;
  errors: ProjectError[];
  warnings: ProjectError[];
}

export interface BulkProjectOperation {
  operation: "update_status" | "assign_manager" | "update_team" | "delete";
  projectIds: string[];
  data: Record<string, any>;
}

export interface BulkProjectOperationResult {
  successful: string[];
  failed: Array<{
    projectId: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Approval History Entry
export interface ApprovalHistoryEntry {
  id: string;
  action: "Submitted" | "Approved" | "Rejected" | "RevisionRequired";
  actorId: string;
  actorName: string;
  timestamp: string;
  comments?: string;
}
