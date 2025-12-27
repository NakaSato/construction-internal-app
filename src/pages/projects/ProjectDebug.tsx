import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@hooks/useProjects";
import { projectsApi } from "@shared/utils/projectsApi";
import { useAuth } from "@hooks/useAuth";
import ProtectedRoute from "@features/auth/ProtectedRoute";

const ProjectDebug: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const { projects, loading, error } = useProjects();
  const [apiTest, setApiTest] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Test API connection
  useEffect(() => {
    const testApiConnection = async () => {
      setTestLoading(true);
      try {
        console.log("🧪 [ProjectDebug] Testing API connection...");
        const result = await projectsApi.getAllProjects();
        setApiTest({
          success: true,
          totalCount: result.totalCount,
          itemCount: result.items?.length || 0,
          sampleProjectIds:
            result.items?.slice(0, 3).map((p) => p.projectId) || [],
          fullResponse: result,
        });
      } catch (err) {
        setApiTest({
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
          details: err,
        });
      } finally {
        setTestLoading(false);
      }
    };

    testApiConnection();
  }, []);

  const testProjectById = async (projectId: string) => {
    try {
      console.log(`🧪 [ProjectDebug] Testing project ID: ${projectId}`);
      const project = await projectsApi.getProjectById(projectId);
      console.log(`✅ [ProjectDebug] Project found:`, project);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error(
        `❌ [ProjectDebug] Failed to fetch project ${projectId}:`,
        err
      );
      alert(
        `Failed to fetch project ${projectId}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Project API Debug
            </h1>
            <p className="text-gray-600 mt-2">
              Debug project ID matching and API connectivity
            </p>
          </div>

          {/* Authentication Status */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Authentication Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Is Authenticated:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isAuthenticated
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isAuthenticated ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              {user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">User:</span>
                    <span className="text-gray-900 font-medium">
                      {user.fullName} ({user.username})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Role:</span>
                    <span className="text-gray-900 font-medium">
                      {user.roleName}
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Token Available:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    token
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {token ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              {!isAuthenticated && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> You must be logged in to access the
                    Projects API. The 400 Bad Request errors you're seeing are
                    likely due to missing authentication.{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="underline hover:no-underline"
                    >
                      Go to Login
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* API Connection Test */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              API Connection Test
            </h2>

            {testLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span>Testing API connection...</span>
              </div>
            ) : apiTest ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    apiTest.success
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span
                      className={`text-2xl mr-2 ${
                        apiTest.success ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {apiTest.success ? "✅" : "❌"}
                    </span>
                    <span
                      className={`font-medium ${
                        apiTest.success ? "text-blue-800" : "text-red-800"
                      }`}
                    >
                      {apiTest.success
                        ? "API Connection Successful"
                        : "API Connection Failed"}
                    </span>
                  </div>

                  {apiTest.success ? (
                    <div className="text-sm text-blue-700">
                      <p>
                        <strong>Total Projects:</strong> {apiTest.totalCount}
                      </p>
                      <p>
                        <strong>Items Returned:</strong> {apiTest.itemCount}
                      </p>
                      <p>
                        <strong>Sample Project IDs:</strong>
                      </p>
                      <ul className="list-disc ml-6 mt-2">
                        {apiTest.sampleProjectIds.map(
                          (id: string, index: number) => (
                            <li key={index} className="font-mono text-xs">
                              {id}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-red-700">
                      <p>
                        <strong>Error:</strong> {apiTest.error}
                      </p>
                    </div>
                  )}
                </div>

                {apiTest.success && (
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-700">
                      View Full API Response
                    </summary>
                    <pre className="mt-4 text-xs bg-white p-4 rounded border overflow-auto max-h-64">
                      {JSON.stringify(apiTest.fullResponse, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : null}
          </div>

          {/* useProjects Hook Data */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              useProjects Hook Data
            </h2>

            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span>Loading projects from hook...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <span className="text-red-600">❌ Hook Error: {error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <span className="text-blue-800">
                    ✅ Hook loaded {projects.length} projects
                  </span>
                </div>

                {projects.length > 0 ? (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Available Projects:
                    </h3>
                    <div className="grid gap-4">
                      {projects.slice(0, 5).map((project) => (
                        <div
                          key={project.projectId}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {project.projectName || "Unnamed Project"}
                              </h4>
                              <p className="text-sm text-gray-600 font-mono">
                                ID: {project.projectId}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: {project.status}
                              </p>
                            </div>
                            <button
                              onClick={() => testProjectById(project.projectId)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Test This Project
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {projects.length > 5 && (
                      <p className="text-sm text-gray-600 mt-4">
                        ... and {projects.length - 5} more projects
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <span className="text-yellow-800">
                      ⚠️ No projects found in hook data
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Project ID Test */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Manual Project ID Test
            </h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter project ID to test..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      testProjectById(target.value.trim());
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector(
                    'input[placeholder*="Enter project ID"]'
                  ) as HTMLInputElement;
                  if (input?.value.trim()) {
                    testProjectById(input.value.trim());
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Test Project ID
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Enter a project ID to test if it can be fetched from the API
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProjectDebug;
