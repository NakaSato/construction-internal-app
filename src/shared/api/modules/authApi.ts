import { ApiClient } from "../../utils/apiClient";
import { ApiResponse } from "../../types/api";

/**
 * Authentication API module
 * Handles all authentication-related endpoints
 */
export class AuthApi {
  constructor(private apiClient: ApiClient) {}

  /**
   * Login user
   */
  async login(credentials: {
    username: string;
    password: string;
  }): Promise<ApiResponse<any>> {
    return this.apiClient.post<ApiResponse<any>>(
      "/api/v1/Auth/login",
      credentials
    );
  }

  /**
   * Register new user
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<ApiResponse<any>> {
    return this.apiClient.post<ApiResponse<any>>(
      "/api/v1/Auth/register",
      userData
    );
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<string>> {
    // Backend binds [FromBody] string — send the raw token, not an object.
    return this.apiClient.post<ApiResponse<string>>(
      "/api/v1/Auth/refresh",
      refreshToken
    );
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<boolean>> {
    return this.apiClient.post<ApiResponse<boolean>>("/api/v1/Auth/logout");
  }
}
