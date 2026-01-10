// Project Search Types
export interface ProjectSearchRequest {
    q?: string;
    filters?: ProjectSearchFilters;
    coordinates?: string; // "lat,lng,radius"
    dateRange?: string;
    facets?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

export interface ProjectSearchFilters {
    status?: string[];
    capacity?: {
        min?: number;
        max?: number;
    };
    location?: string[];
    managerId?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
}

export interface ProjectSearchResponse {
    query: string;
    results: ProjectSearchResult[];
    facets: ProjectSearchFacets;
    suggestions: string[];
    totalResults: number;
    searchTime: number;
}

export interface ProjectSearchResult {
    projectId: string;
    projectName: string;
    relevanceScore: number;
    matchedFields: string[];
    highlights: string[];
}

export interface ProjectSearchFacets {
    status: Record<string, number>;
    capacity: Record<string, number>;
    location: Record<string, number>;
}

// Query Parameters for Get All Projects
export interface GetProjectsParams {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    fields?: string;
    managerId?: string;
}

// Analytics Query Parameters
export interface ProjectAnalyticsParams {
    timeframe?: "30d" | "90d" | "1y" | "all";
    groupBy?: "status" | "manager" | "month" | "quarter";
    includeFinancial?: boolean;
    includePerformance?: boolean;
}
