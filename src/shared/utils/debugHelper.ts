/**
 * Debug Helper Utilities
 * Provides debugging tools for development environment
 */

/**
 * Log module initialization to help debug circular dependencies
 */
export const logModuleInit = (moduleName: string) => {
  if (import.meta.env.DEV) {
    console.debug(`🔧 Module initialized: ${moduleName}`);
  }
};

/**
 * Check for potential ReferenceError patterns
 */
export const checkVariableAccess = (varName: string, value: any) => {
  if (import.meta.env.DEV) {
    try {
      if (value === undefined) {
        console.warn(`[WARN] ⚠️ Variable '${varName}' is undefined`);
      }
      return value;
    } catch (error) {
      console.error(`❌ ReferenceError accessing '${varName}':`, error);
      throw error;
    }
  }
  return value;
};

/**
 * Safe variable access with fallback
 */
export const safeAccess = <T>(
  accessor: () => T,
  fallback: T,
  varName?: string
): T => {
  try {
    return accessor();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        `❌ Safe access failed for ${varName || "unknown"}:`,
        error
      );
    }
    return fallback;
  }
};

/**
 * Debug circular dependency imports
 */
export const debugImport = (moduleName: string, importedValue: any) => {
  if (import.meta.env.DEV) {
    if (importedValue === undefined) {
      console.warn(`[WARN] ⚠️ Circular dependency detected in ${moduleName}`);
    } else {
      console.debug(`[SUCCESS] ✅ Module import successful: ${moduleName}`);
    }
  }
  return importedValue;
};
