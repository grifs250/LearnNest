/**
 * Utility functions for handling URL parameters
 */

/**
 * Validates and normalizes a role value
 * @param roleParam - Role parameter from URL query
 * @returns 'teacher' | 'student' or undefined if invalid
 */
export function validateRole(roleParam: string | string[] | undefined): 'teacher' | 'student' | undefined {
  if (!roleParam) return undefined;
  
  const role = Array.isArray(roleParam) ? roleParam[0] : roleParam;
  
  if (role === 'teacher' || role === 'student') {
    return role;
  }
  
  return undefined;
}

/**
 * Safely extracts a string parameter from URL search params
 * @param searchParams - URL search parameters
 * @param paramName - Name of the parameter to extract
 * @returns The parameter value as a string or undefined
 */
export function getStringParam(
  searchParams: { [key: string]: string | string[] | undefined } | undefined,
  paramName: string
): string | undefined {
  if (!searchParams) return undefined;
  
  const param = searchParams[paramName];
  if (!param) return undefined;
  
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Safely extracts a number parameter from URL search params
 * @param searchParams - URL search parameters
 * @param paramName - Name of the parameter to extract
 * @returns The parameter value as a number or undefined
 */
export function getNumberParam(
  searchParams: { [key: string]: string | string[] | undefined } | undefined,
  paramName: string
): number | undefined {
  const param = getStringParam(searchParams, paramName);
  if (param === undefined) return undefined;
  
  const num = Number(param);
  return isNaN(num) ? undefined : num;
} 