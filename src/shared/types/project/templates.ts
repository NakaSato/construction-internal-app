// Project Templates
export interface ProjectTemplateDto {
    templateId: string;
    name: string;
    description: string;
    category: string;
    estimatedDuration: number;
    defaultTasks: TemplateTask[];
    requiredEquipment: string[];
    usageCount: number;
}

export interface TemplateTask {
    title: string;
    estimatedHours: number;
    phase: string;
}

export interface CreateProjectFromTemplateRequest {
    projectName: string;
    address: string;
    clientInfo: string;
    totalCapacityKw: number;
    projectManagerId: string;
    startDate: string;
    customizations?: ProjectCustomizations;
}

export interface ProjectCustomizations {
    skipTasks?: string[];
    additionalTasks?: TemplateTask[];
}

// Daily Report Template
export interface DailyReportTemplate {
    id: string;
    name: string;
    description: string;
    projectId: string;
    projectType: string;
    fields: TemplateField[];
    requiredFields: string[];
    defaultValues: Record<string, any>;
    validationRules: TemplateValidationRule[];
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
}

// Template Field
export interface TemplateField {
    name: string;
    label: string;
    type: "Text" | "Number" | "Date" | "Select" | "TextArea" | "Checkbox";
    isRequired: boolean;
    helpText?: string;
    displayOrder: number;
    constraints?: FieldConstraints;
    defaultValue?: any;
    options?: string[];
}

// Field Constraints
export interface FieldConstraints {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}

// Template Validation Rule
export interface TemplateValidationRule {
    name: string;
    type: "Range" | "Required" | "Pattern" | "Custom";
    field: string;
    parameters: Record<string, any>;
    errorMessage: string;
    severity: "Error" | "Warning" | "Info";
}
