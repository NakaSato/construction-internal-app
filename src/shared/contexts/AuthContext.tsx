import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthService } from "../utils/authService";
import {
  User,
  AuthContextType,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context for use in custom hooks
export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user && token);

  const [initializationPromise] = useState(() => {
    return (async () => {
      try {
        // Initialize auth service
        AuthService.initializeAuth();

        const storedToken = AuthService.getToken();
        const storedUser = AuthService.getUser();

        if (
          storedToken &&
          storedUser &&
          AuthService.isTokenValid(storedToken)
        ) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          // Try to refresh token only if we have API available
          try {
            const refreshed = await AuthService.refreshToken();
            if (refreshed) {
              const newToken = AuthService.getToken();
              const newUser = AuthService.getUser();
              setToken(newToken);
              setUser(newUser);
            }
          } catch (refreshError) {
            console.warn(
              "Token refresh failed (API might be unavailable):",
              refreshError
            );
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (import.meta.env.DEV) {
          AuthService.logout();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  });

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      try {
        const payload = AuthService.decodeToken(token);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;

        // Refresh token if it expires in less than 5 minutes
        if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
          AuthService.refreshToken()
            .then((success) => {
              if (success) {
                const newToken = AuthService.getToken();
                const newUser = AuthService.getUser();
                setToken(newToken);
                setUser(newUser);
              } else {
                logout();
              }
            })
            .catch((error) => {
              console.warn("Token refresh failed:", error);
              // Don't logout in production if it's just an API issue
              if (import.meta.env.DEV) {
                logout();
              }
            });
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        // Don't logout in production if it's just an API issue
        if (import.meta.env.DEV) {
          logout();
        }
      }
    };

    // Check token expiry every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);

      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Login failed:", error);

      // Parse API error response if available for better error messages
      if (error.message && error.message.includes("HTTP error! status:")) {
        const errorMatch = error.message.match(
          /HTTP error! status: (\d+) - (.+)/
        );
        if (errorMatch) {
          try {
            const errorData = JSON.parse(errorMatch[2]);
            console.error("API Error Details:", errorData);
          } catch (parseError) {
            console.error("Could not parse API error response");
          }
        }
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(userData);

      if (response.success) {
        console.log("Registration successful:", response.message);
        return true;
      } else {
        // Create an error object that matches what the RegisterForm expects
        const error = new Error(response.message || "Registration failed");
        (error as any).response = {
          data: {
            message: response.message,
            errors: response.errors || ["Registration failed"],
          },
          status: 400, // Bad Request for validation errors
        };
        throw error;
      }
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Parse API error response if available
      if (error.message && error.message.includes("HTTP error! status:")) {
        const errorMatch = error.message.match(
          /HTTP error! status: (\d+) - (.+)/
        );
        if (errorMatch) {
          try {
            const errorData = JSON.parse(errorMatch[2]);
            const apiError = new Error(
              errorData.message || "Registration failed"
            );
            (apiError as any).response = {
              data: {
                message: errorData.message,
                errors: errorData.errors || ["Registration failed"],
              },
            };
            throw apiError;
          } catch (parseError) {
            // Fallback to original error
          }
        }
      }

      throw error; // Re-throw so RegisterForm can handle it properly
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await AuthService.refreshToken();
      if (success) {
        const newToken = AuthService.getToken();
        const newUser = AuthService.getUser();
        setToken(newToken);
        setUser(newUser);
      }
      return success;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await AuthService.logout();
      console.log("Logout response:", response);

      // Always clear the context state after logout attempt
      setToken(null);
      setUser(null);

      if (response.success) {
        console.log("Logout successful:", response.message);
      } else {
        console.warn("Logout completed with warnings:", response.errors);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear the state even if logout fails
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshToken,
    initializationPromise,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
