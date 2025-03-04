/**
 * Extracts the role parameter from URL search params
 * @param searchParams - URL search parameters
 * @returns 'teacher' | 'student' or undefined if not present
 */
export function extractRoleFromUrl(searchParams: { [key: string]: string | string[] | undefined }): 'teacher' | 'student' | undefined {
  const roleParam = searchParams.role;
  
  if (!roleParam) return undefined;
  
  const role = Array.isArray(roleParam) ? roleParam[0] : roleParam;
  
  if (role === 'teacher' || role === 'student') {
    return role;
  }
  
  return undefined;
} 