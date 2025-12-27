import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { DashboardProvider } from "../shared/contexts";
import { Home, About, Login, Register, NotFound, ProjectDebug } from "../pages";
import {
  DashboardLazy,
  ProjectDetailLazy,
  ProjectDetailRefactoredLazy,
  DailyReportsLazy,
  ProjectScheduleLazy,
  RealTimeProjectDashboardLazy,
} from "./LazyPages";
import { Navigation } from "../widgets";
import Footer from "../components/layout/Footer";
import ProtectedRoute from "../features/auth/ProtectedRoute";

function AppRoutesContent() {
  const { isLoading } = useAuth();
  const location = useLocation();

  // Check if we're on a public page where we want the legacy navigation
  const isPublicPage = ["/", "/about", "/login", "/register", "/home"].includes(location.pathname);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50 flex flex-col">
      {isPublicPage && <Navigation />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute redirectToIndex={true}>
                <DashboardLazy />
              </ProtectedRoute>
            }
          />

          {/* Real-time Project Management Dashboard */}
          <Route
            path="/projects/realtime"
            element={
              <ProtectedRoute redirectToIndex={true}>
                <RealTimeProjectDashboardLazy />
              </ProtectedRoute>
            }
          />

          {/* Project Detail Page */}
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute redirectToIndex={true}>
                <ProjectDetailLazy />
              </ProtectedRoute>
            }
          />

          {/* Refactored Project Detail Page (for testing) */}
          <Route
            path="/projects/:projectId/refactored"
            element={
              <ProtectedRoute redirectToIndex={true}>
                <ProjectDetailRefactoredLazy />
              </ProtectedRoute>
            }
          />

          {/* Project Debug Page */}
          <Route
            path="/debug/projects"
            element={
              <ProtectedRoute redirectToIndex={true}>
                <ProjectDebug />
              </ProtectedRoute>
            }
          />

          {/* Project Schedule Management Page */}
          <Route
            path="/projects/:projectId/schedule"
            element={
              <ProtectedRoute redirectToIndex={true}>
                <ProjectScheduleLazy />
              </ProtectedRoute>
            }
          />

          {/* Daily Reports Management */}
          <Route
            path="/daily-reports"
            element={
              <ProtectedRoute redirectToIndex={true}>
                <DailyReportsLazy />
              </ProtectedRoute>
            }
          />
          {/* 404 Not Found - This will catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {isPublicPage && <Footer />}
    </div>
  );
}

function AppRoutes() {
  return (
    <DashboardProvider>
      <AppRoutesContent />
    </DashboardProvider>
  );
}

export default AppRoutes;
