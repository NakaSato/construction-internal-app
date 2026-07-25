// Authentication types
export interface User {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  roleName: string | null;
  roleId?: number; // Backend omits this; derived from roleName client-side
  isActive: boolean;
}

export interface LoginRequest {
  username: string; // Can be username or email
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  } | null;
  errors: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roleId?: number; // Optional, defaults to User role
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data:
  | User
  | {
    user: User; // Support both formats from API documentation
  }
  | null;
  errors: string[];
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  data: null;
  errors: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  devBypass?: () => void; // DEV-only: skip auth, inject fake admin. Stripped in prod build.
  initializationPromise?: Promise<void>;
}

// Role types
export enum UserRole {
  ADMIN = 1,
  MANAGER = 2,
  USER = 3,
  VIEWER = 4,
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string; // 'create' | 'read' | 'update' | 'delete'
}

// Token payload
export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
  exp: number;
  iat: number;
}

// API endpoints for auth
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/v1/Auth/login", // Uppercase 'Auth' per API documentation
  REGISTER: "/api/v1/Auth/register", // Uppercase 'Auth' per API documentation
  REFRESH: "/api/v1/Auth/refresh", // Uppercase 'Auth' per API documentation
  LOGOUT: "/api/v1/Auth/logout", // Fixed: uppercase 'Auth' for consistency
  PROFILE: "/api/v1/Auth/profile", // Fixed: uppercase 'Auth' for consistency
  CHANGE_PASSWORD: "/api/v1/Auth/change-password", // Fixed: uppercase 'Auth' for consistency
} as const;
