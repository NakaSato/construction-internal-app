import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { AuthContextType } from "../types/auth";

// Hook to use authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Role-based access hooks
export const useRole = () => {
  const { user } = useAuth();

  return {
    isAdmin: user?.roleId === 1,
    isManager: user?.roleId === 2 || user?.roleId === 1,
    isUser: user?.roleId === 3 || user?.roleId === 2 || user?.roleId === 1,
    isViewer: Boolean(user), // All authenticated users can view
    hasRole: (roleId: number) =>
      user?.roleId != null ? user.roleId <= roleId : false,
    roleName: user?.roleName,
  };
};
