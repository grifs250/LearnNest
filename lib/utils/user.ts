export function formatClerkId(clerkId: string): string {
  // Remove any non-alphanumeric characters and ensure length is 32
  const cleanId = clerkId.replace(/[^a-zA-Z0-9]/g, '');
  // Pad or truncate to exactly 32 characters
  return cleanId.padEnd(32, '0').slice(0, 32);
} 