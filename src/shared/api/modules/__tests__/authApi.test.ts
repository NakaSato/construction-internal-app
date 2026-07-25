import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthApi } from "../authApi";
import { ApiClient } from "../../../utils/apiClient";

// Mock the ApiClient
vi.mock("../../../utils/apiClient");

describe("AuthApi", () => {
  let authApi: AuthApi;
  let mockApiClient: any;

  beforeEach(() => {
    // Create a mock instance of ApiClient
    mockApiClient = {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      setAuthToken: vi.fn(),
      clearAuthToken: vi.fn(),
    };

    authApi = new AuthApi(mockApiClient as ApiClient);
  });

  describe("login", () => {
    it("should call login endpoint with correct credentials", async () => {
      // Arrange
      const credentials = {
        username: "testuser",
        password: "testpass123",
      };
      const mockResponse = {
        success: true,
        data: { token: "mock-token", user: { id: "1" } },
        message: "Login successful",
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authApi.login(credentials);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/api/v1/Auth/login",
        credentials
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle login errors", async () => {
      // Arrange
      const credentials = { username: "test", password: "wrong" };
      const mockError = new Error("Invalid credentials");
      mockApiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(authApi.login(credentials)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("register", () => {
    it("should call register endpoint with user data", async () => {
      // Arrange
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "newpass123",
        fullName: "New User",
        role: "User",
      };
      const mockResponse = {
        success: true,
        data: { id: "2", username: "newuser" },
        message: "Registration successful",
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authApi.register(userData);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/api/v1/Auth/register",
        userData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("refreshToken", () => {
    it("should call refresh token endpoint", async () => {
      // Arrange
      const refreshToken = "mock-refresh-token";
      const mockResponse = {
        success: true,
        data: "new-access-token",
        message: "Token refreshed",
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authApi.refreshToken(refreshToken);

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/api/v1/Auth/refresh",
        refreshToken
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("should call logout endpoint", async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: true,
        message: "Logout successful",
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authApi.logout();

      // Assert
      expect(mockApiClient.post).toHaveBeenCalledWith("/api/v1/Auth/logout");
      expect(result).toEqual(mockResponse);
    });
  });
});
