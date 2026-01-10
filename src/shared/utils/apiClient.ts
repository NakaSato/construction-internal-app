import { env } from "../config/env";

// API Client configuration
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    // Normalize the base URL by removing trailing slash if present
    // Handle empty API_BASE_URL for demo mode
    this.baseURL = env.API_BASE_URL ? env.API_BASE_URL.replace(/\/$/, "") : "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    console.log(
      "API Client initialized with base URL:",
      this.baseURL || "(Demo Mode - No API)"
    );
  }

  // Update base URL - useful for testing or switching endpoints
  setBaseURL(url: string): void {
    // Normalize the base URL by removing trailing slash if present
    this.baseURL = url.replace(/\/$/, "");
    console.log("API base URL updated to:", this.baseURL);
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
    console.log("🔑 API Client: Authentication token set");
  }

  // Clear authentication token
  clearAuthToken(): void {
    const { Authorization, ...headersWithoutAuth } = this.defaultHeaders as any;
    this.defaultHeaders = headersWithoutAuth;
    console.log("🔑 API Client: Authentication token cleared");
  }

  // Get current auth token from localStorage (fallback)
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem("solar_auth_token");
    } catch (error) {
      console.warn("Could not retrieve auth token from localStorage:", error);
      return null;
    }
  }

  // Get headers with authentication
  private getHeaders(): Record<string, string> {
    // If no Authorization header is set, try to get token from localStorage
    const headers = { ...this.defaultHeaders } as Record<string, string>;

    if (!headers.Authorization) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log("API Client: Using token from localStorage");
      } else {
        console.log("API Client: No authentication token available");
      }
    }

    return headers;
  }

  // Normalize URL construction to prevent double slashes
  private buildUrl(endpoint: string): string {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    return `${this.baseURL}${normalizedEndpoint}`;
  }

  // Generic request wrapper
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Handle demo mode (no API base URL)
    if (!this.baseURL) {
      console.warn(
        "🎭 Demo Mode: No API configured, simulating error response"
      );
      const error = new Error("Demo Mode: API not available");
      (error as any).response = {
        status: 503,
        statusText: "Service Unavailable",
        body: "Demo Mode - No API configured",
        url: endpoint,
      };
      throw error;
    }

    const url = this.buildUrl(endpoint);
    const headers = this.getHeaders();

    // Merge provided options with defaults
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    console.log(`📡 API Request: ${requestOptions.method || "GET"} ${url}`);
    console.log(`📡 API Headers:`, {
      ...headers,
      Authorization: headers.Authorization ? "[REDACTED]" : "none",
    });

    try {
      const response = await fetch(url, requestOptions);

      // Handle different response types
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ API Error: ${response.status} ${response.statusText}`,
          {
            url,
            method: requestOptions.method || "GET",
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          }
        );

        // Create enhanced error with response details
        const error = new Error(
          `API Error: ${response.status} ${response.statusText}`
        );

        // Attach response details to the error for better error handling
        (error as any).response = {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url,
        };

        // Handle specific error cases
        if (response.status === 401) {
          const authError = new Error(
            "Authentication required. Please log in."
          );
          (authError as any).response = { status: 401, body: errorText };
          throw authError;
        }
        if (response.status === 403) {
          const forbiddenError = new Error(
            "Access denied. Insufficient permissions."
          );
          (forbiddenError as any).response = { status: 403, body: errorText };
          throw forbiddenError;
        }
        if (response.status === 404) {
          const notFoundError = new Error("Resource not found.");
          (notFoundError as any).response = { status: 404, body: errorText };
          throw notFoundError;
        }

        throw error;
      }

      // Parse JSON response
      const data = await response.json();
      console.log(`✅ API Response: ${response.status}`, { hasData: !!data });
      return data;
    } catch (error) {
      console.error(`❌ API Request failed:`, {
        url,
        method: requestOptions.method || "GET",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit
  ): Promise<T> {
    const config: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, config);
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit
  ): Promise<T> {
    const config: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, config);
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit
  ): Promise<T> {
    const config: RequestInit = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, config);
  }

  // Health check - use configured API base URL
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Use the normalized URL building approach
      const healthUrl = this.buildUrl("/health");
      console.log("Current baseURL:", this.baseURL);
      console.log("Checking API health at:", healthUrl);

      // Force disable any caching
      const options = {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        // Add a random param to bust any cache
        cache: "no-store" as RequestCache,
      };

      const response = await fetch(healthUrl, options);

      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Log the API configuration for debugging
if (env.IS_DEVELOPMENT) {
  console.log("API Client configured with base URL:", env.API_BASE_URL);
}
