import { ProjectDto } from "./core";
import { DailyReportApprovalStatus } from "./daily-reports";

// Real-time update types for SignalR/WebSocket integration
export interface ProjectUpdateNotification {
    type:
    | "PROJECT_CREATED"
    | "PROJECT_UPDATED"
    | "PROJECT_DELETED"
    | "PROJECT_STATUS_CHANGED";
    projectId: string;
    projectName: string;
    updatedBy: {
        userId: string;
        fullName: string;
    };
    timestamp: string;
    changes?: Record<string, any>;
    previousValues?: Record<string, any>;
}

export interface RealTimeProjectUpdate {
    projectId: string;
    updateType: "created" | "updated" | "deleted" | "status_changed";
    data: Partial<ProjectDto>;
    metadata: {
        updatedBy: string;
        timestamp: string;
        changeDescription?: string;
    };
}

// Real-time Daily Report Update Notification
export interface DailyReportUpdateNotification {
    type:
    | "DAILY_REPORT_CREATED"
    | "DAILY_REPORT_UPDATED"
    | "DAILY_REPORT_APPROVED"
    | "DAILY_REPORT_REJECTED"
    | "DAILY_REPORT_SUBMITTED";
    reportId: string;
    projectId: string;
    projectName: string;
    reportDate: string;
    updatedBy: {
        userId: string;
        fullName: string;
    };
    timestamp: string;
    changes?: Record<string, any>;
    previousStatus?: DailyReportApprovalStatus;
    newStatus?: DailyReportApprovalStatus;
}
