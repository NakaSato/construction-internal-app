import React from "react";
import { ProjectDto } from "@shared/types/project";
import PerformanceMetrics from "../PerformanceMetrics";

interface PerformanceTabProps {
    project: ProjectDto;
    performance: any;
}

const PerformanceTab = ({ project, performance }: PerformanceTabProps) => {
    return (
        <div className="space-y-8">
            <PerformanceMetrics performance={performance} />
        </div>
    );
};

export default PerformanceTab;
