import { apiClient } from "./apiClient";
import toast from "react-hot-toast";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
  User,
  TokenPayload,
  AUTH_ENDPOINTS,
} from "../types/auth";

export class AuthService {
  private static readonly TOKEN_KEY = "solar_auth_token";
  private static readonly REFRESH_TOKEN_KEY = "solar_refresh_token";
  private static readonly USER_KEY = "solar_user";

  // Backend returns roleName (string) but omits numeric roleId.
  // RBAC hooks (useRole, hasRole, hasPermission) key off roleId, so derive it.
  private static readonly ROLE_NAME_TO_ID: Record<string, number> = {
    admin: 1,
    manager: 2,
    user: 3,
    engineer: 3,
    technician: 3,
    viewer: 4,
  };

  static roleIdFromName(roleName: string | null | undefined): number | undefined {
    if (!roleName) return undefined;
    return this.ROLE_NAME_TO_ID[roleName.toLowerCase()];
  }

  // Backfill numeric roleId from roleName when the backend omits it.
  static normalizeUser(user: User): User {
    if (user && user.roleId == null) {
      return { ...user, roleId: this.roleIdFromName(user.roleName) };
    }
    return user;
  }

  // Safe localStorage access with fallback
  private static isStorageAvailable(): boolean {
    try {
      return typeof window !== "undefined" && window.localStorage !== undefined;
    } catch (e) {
      return false;
    }
  }

  private static setStorage(key: string, value: string): void {
    if (this.isStorageAvailable()) {
      localStorage.setItem(key, value);
    }
  }

  private static getStorage(key: string): string | null {
    if (this.isStorageAvailable()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private static removeStorage(key: string): void {
    if (this.isStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  // Login user
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log("AuthService: Attempting login with credentials:", {
      username: credentials.username,
    });

    // Show loading toast
    const loadingToastId = toast.loading("Signing in...");

    try {
      console.log("AuthService: Trying API login");
      const response = await apiClient.post<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        // Backfill roleId from roleName (mutates so callers reading
        // response.data.user directly, e.g. AuthContext, get it too)
        response.data.user = this.normalizeUser(response.data.user);

        // Store tokens and user data
        this.setToken(response.data.token);
        this.setRefreshToken(response.data.refreshToken);
        this.setUser(response.data.user);

        // Update API client default headers
        apiClient.setAuthToken(response.data.token);

        // Show success toast
        toast.success(`Welcome back, ${response.data.user.fullName}!`, {
          id: loadingToastId,
        });
      } else {
        // Show error toast for unsuccessful response
        toast.error(response.message || "Login failed", {
          id: loadingToastId,
        });
      }

      return response;
    } catch (error: any) {
      console.error("AuthService: API login failed:", error);

      // Show error toast
      let errorMessage = "Login failed. Please try again.";
      if (error.message && error.message.includes("HTTP error! status: 401")) {
        errorMessage = "Invalid username or password";
      } else if (
        error.message &&
        error.message.includes("HTTP error! status: 400")
      ) {
        errorMessage = "Please check your credentials";
      } else if (error.message && error.message.includes("Failed to fetch")) {
        errorMessage =
          "Connection error. Please check your internet connection.";
      }

      toast.error(errorMessage, {
        id: loadingToastId,
      });

      // Re-throw the error for proper error handling upstream
      throw error;
    }
  }

  // Register new user
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    // Show loading toast
    const loadingToastId = toast.loading("Creating your account...");

    try {
      console.log("AuthService: Attempting API registration with data:", {
        ...userData,
        password: "[REDACTED]", // Don't log password for security
      });

      const response = await apiClient.post<RegisterResponse>(
        AUTH_ENDPOINTS.REGISTER,
        userData
      );

      // Handle both response formats from API (direct User object or nested user property)
      if (response.success && response.data) {
        // Show success toast
        toast.success("Account created successfully! You can now log in.", {
          id: loadingToastId,
        });

        // If the response data contains a direct User object (as in API docs)
        if ("userId" in response.data) {
          // Convert to expected format for consistency
          return {
            success: response.success,
            message: response.message,
            data: { user: response.data },
            errors: response.errors || [],
          };
        }
      } else {
        // Show error toast for unsuccessful response
        toast.error(response.message || "Registration failed", {
          id: loadingToastId,
        });
      }

      return response;
    } catch (error: any) {
      console.error("AuthService: API registration failed:", error);

      // Show error toast with detailed message
      let errorMessage = "Registration failed. Please try again.";
      if (error.message && error.message.includes("HTTP error! status: 400")) {
        errorMessage = "Please check your information and try again.";
      } else if (
        error.message &&
        error.message.includes("HTTP error! status: 409")
      ) {
        errorMessage = "An account with this email already exists.";
      } else if (error.message && error.message.includes("Failed to fetch")) {
        errorMessage =
          "Connection error. Please check your internet connection.";
      }

      toast.error(errorMessage, {
        id: loadingToastId,
      });

      // Format error for better user experience
      if (error.message && error.message.includes("HTTP error! status: 400")) {
        // Try to extract validation errors from the response
        try {
          const errorMatch = error.message.match(
            /HTTP error! status: 400 - (.+)/
          );
          if (errorMatch && errorMatch[1]) {
            const errorData = JSON.parse(errorMatch[1]);
            const formattedError: RegisterResponse = {
              success: false,
              message: errorData.message || "Registration failed",
              data: null,
              errors: errorData.errors || ["Registration failed"],
            };
            throw formattedError;
          }
        } catch (parseError) {
          // Fallback if parsing fails
        }
      }

      // Re-throw the error for proper error handling upstream
      throw error;
    }
  }

  // Refresh authentication token
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      console.log("AuthService: Attempting token refresh");
      // Backend binds [FromBody] string — send the raw token as a JSON string,
      // not an object.
      const response = await apiClient.post<LoginResponse>(
        AUTH_ENDPOINTS.REFRESH,
        refreshToken
      );

      if (response.success && response.data) {
        response.data.user = this.normalizeUser(response.data.user);
        this.setToken(response.data.token);
        this.setRefreshToken(response.data.refreshToken);
        this.setUser(response.data.user);
        apiClient.setAuthToken(response.data.token);

        // Show subtle success toast for token refresh
        toast.success("Session refreshed", {
          duration: 2000,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("AuthService: Token refresh failed:", error);

      // Show error toast when token refresh fails
      toast.error("Session expired. Please log in again.", {
        duration: 4000,
      });

      this.logout();
      return false;
    }
  }

  // Logout user
  static async logout(): Promise<LogoutResponse> {
    console.log("AuthService: Attempting logout");

    // Show loading toast
    const loadingToastId = toast.loading("Signing out...");

    try {
      // Call logout endpoint if token exists
      const token = this.getToken();
      let apiResponse: LogoutResponse = {
        success: true,
        message: "Logout successful",
        data: null,
        errors: [],
      };

      if (token) {
        console.log("AuthService: Calling logout API endpoint");
        try {
          apiResponse = await apiClient.post<LogoutResponse>(
            AUTH_ENDPOINTS.LOGOUT,
            {}
          );
          console.log("AuthService: Logout API call successful:", apiResponse);
        } catch (error) {
          console.warn(
            "AuthService: Logout API call failed, continuing with local logout:",
            error
          );
          // Continue with local logout even if API call fails
        }
      }

      // Show success toast
      toast.success("Successfully signed out!", {
        id: loadingToastId,
      });

      return apiResponse;
    } catch (error) {
      console.error("AuthService: Logout process failed:", error);

      // Show error toast but still proceed with local logout
      toast.error("Signed out locally", {
        id: loadingToastId,
      });

      // Return a fallback response
      return {
        success: false,
        message: "Logout failed",
        data: null,
        errors: ["Logout process encountered an error"],
      };
    } finally {
      // Always clear local storage regardless of API call success
      console.log("AuthService: Clearing local authentication data");
      this.removeStorage(this.TOKEN_KEY);
      this.removeStorage(this.REFRESH_TOKEN_KEY);
      this.removeStorage(this.USER_KEY);
      apiClient.clearAuthToken();
    }
  }

  // Token management
  static setToken(token: string): void {
    this.setStorage(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return this.getStorage(this.TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    this.setStorage(this.REFRESH_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return this.getStorage(this.REFRESH_TOKEN_KEY);
  }

  // User management
  static setUser(user: User): void {
    this.setStorage(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userData = this.getStorage(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Token validation
  static isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  static decodeToken(token: string): TokenPayload {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? this.isTokenValid(token) : false;
  }

  // Get current user
  static getCurrentUser(): User | null {
    if (this.isAuthenticated()) {
      return this.getUser();
    }
    return null;
  }

  // Role-based access control
  static hasRole(requiredRoleId: number): boolean {
    const user = this.getCurrentUser();
    return user?.roleId != null ? user.roleId >= requiredRoleId : false;
  }

  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Define role permissions
    const rolePermissions: Record<number, string[]> = {
      1: ["admin", "manager", "user", "viewer"], // Admin - all permissions
      2: ["manager", "user", "viewer"], // Manager
      3: ["user", "viewer"], // User
      4: ["viewer"], // Viewer
    };

    const userPermissions =
      user.roleId != null ? rolePermissions[user.roleId] || [] : [];
    return userPermissions.includes(permission);
  }

  // Initialize auth state on app start
  static initializeAuth(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      apiClient.setAuthToken(token);
    } else {
      this.logout();
    }
  }
}
