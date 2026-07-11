import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

// Generic API hook state
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook for GET requests
export function useApi<T>(
  endpoint: string,
  dependencies: unknown[] = []
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await apiClient.get<T>(endpoint);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    // fetchData sets loading:true synchronously before its first await — intended
    // fetch-loading indicator, not derived state; cannot cascade/loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Hook for mutations (POST, PUT, DELETE, etc.)
export function useMutation<T, V = unknown>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (
    method: "POST" | "PUT" | "DELETE" | "PATCH",
    endpoint: string,
    data?: V
  ): Promise<T | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      let result: T;
      switch (method) {
        case "POST":
          result = await apiClient.post<T>(endpoint, data);
          break;
        case "PUT":
          result = await apiClient.put<T>(endpoint, data);
          break;
        case "DELETE":
          result = await apiClient.delete<T>(endpoint);
          break;
        case "PATCH":
          result = await apiClient.patch<T>(endpoint, data);
          break;
      }

      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({ data: null, loading: false, error: errorMessage });
      return null;
    }
  };

  return {
    ...state,
    mutate,
  };
}
