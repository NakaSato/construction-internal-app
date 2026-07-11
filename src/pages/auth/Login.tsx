import React, { useMemo } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { LoginForm } from "@features/auth";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Derive registration-success message from the URL query (pure).
  const message = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("registered") === "true"
      ? "Registration successful! Please log in with your new account."
      : null;
  }, [location.search]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      {message && (
        <div className="mt-4 mb-2 w-full max-w-md bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}
