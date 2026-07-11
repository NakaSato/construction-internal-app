import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AlertCircle, ArrowLeftCircle } from "lucide-react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle
} from "@mui/material";
import { AuthProvider } from "../shared/contexts/AuthContext";
import "./App.css"; // Keeping for specific globs if any
import AppRoutes from "./AppRoutes";

// Global error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global Error Boundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "grey.50",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <Container maxWidth="sm">
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ color: "error.main", mb: 2, display: "flex", justifyContent: "center" }}>
                <AlertCircle size={64} />
              </Box>

              <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: "bold" }}>
                Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                An unexpected error occurred in the application. Please try
                refreshing the page or contact support if the issue persists.
              </Typography>

              {import.meta.env.DEV && this.state.error && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 4,
                    bgcolor: "error.lighter",
                    borderColor: "error.light",
                    textAlign: "left"
                  }}
                >
                  <Typography variant="subtitle2" color="error.dark" gutterBottom sx={{ fontWeight: "bold" }}>
                    Error Details (Development Mode)
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "0.875rem",
                      color: "error.main",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      m: 0,
                      fontFamily: "monospace"
                    }}
                  >
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {"\n\nStack Trace:\n"}
                        {this.state.error.stack}
                      </>
                    )}
                  </Box>
                </Paper>
              )}

              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.reload()}
                  sx={{ px: 3 }}
                >
                  Reload Page
                </Button>
                <Button
                  variant="contained"
                  color="inherit" // Maps to gray in default theme usually, or customized
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                  }}
                  startIcon={<ArrowLeftCircle size={18} />}
                  sx={{
                    px: 3,
                    bgcolor: "grey.700",
                    color: "white",
                    "&:hover": {
                      bgcolor: "grey.800",
                    }
                  }}
                >
                  Try Again
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                // react-hot-toast applies its default background/color via
                // inline styles, which beat Tailwind classes. Set colors via
                // `style` so they actually apply; keep layout in className.
                className: "rounded-lg text-sm max-w-md",
                style: {
                  background: "#1f2937", // gray-800
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
                success: {
                  duration: 3000,
                  iconTheme: { primary: "#10b981", secondary: "#fff" },
                  style: { background: "#059669", color: "#fff" }, // emerald-600
                },
                error: {
                  duration: 6000,
                  iconTheme: { primary: "#fff", secondary: "#dc2626" },
                  style: { background: "#dc2626", color: "#fff" }, // red-600
                },
                loading: {
                  iconTheme: { primary: "#fff", secondary: "#2563eb" },
                  style: { background: "#2563eb", color: "#fff" }, // blue-600
                },
              }}
            />
          </Box>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
