import React from "react";
import { ProjectDto } from "@shared/types/project";
import TechnicalSpecs from "../TechnicalSpecs";
import EquipmentDetails from "../EquipmentDetails";

interface SpecsTabProps {
    project: ProjectDto;
}

const SpecsTab = ({ project }: SpecsTabProps) => {
    return (
        <div className="space-y-8">
            <TechnicalSpecs project={project} />
            {project.equipmentDetails && (
                <EquipmentDetails project={project} />
            )}
        </div>
    );
};

export default SpecsTab;
