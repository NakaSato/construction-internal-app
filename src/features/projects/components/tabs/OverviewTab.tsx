import React from "react";
import { ProjectDto, ProjectPerformanceDto } from "@shared/types/project";
import ProjectOverview from "../ProjectOverview";
import ProjectProgress from "../ProjectProgress";
import ProjectTimelinePlanning from "../ProjectTimelinePlanning";

interface OverviewTabProps {
    project: ProjectDto;
    performance?: ProjectPerformanceDto | null;
    loadingPerformance?: boolean;
}

const OverviewTab = ({ project }: OverviewTabProps) => {
    return (
        <div className="space-y-8">
            <ProjectOverview project={project} />
            <ProjectTimelinePlanning project={project} />
            <ProjectProgress project={project} />
        </div>
    );
};

export default OverviewTab;
