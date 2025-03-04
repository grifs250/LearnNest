/**
 * Helper utilities for MāciesTe application
 */

/**
 * Formats a Clerk ID by removing the 'user_' prefix if present
 * @param clerkId The Clerk user ID to format
 * @returns Formatted ID for Supabase
 */
export function formatClerkId(clerkId: string): string {
  return clerkId.startsWith('user_') ? clerkId.replace('user_', '') : clerkId;
}

/**
 * Constants for time formatting
 */
export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
};

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', DATE_FORMAT_OPTIONS);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a time string to a readable format
 * @param timeString ISO date string
 * @returns Formatted time string
 */
export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return 'N/A';
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('lv-LV', TIME_FORMAT_OPTIONS);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
}

/**
 * Format date and time together
 * @param dateTimeString ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateTimeString: string | null | undefined): string {
  if (!dateTimeString) return 'N/A';
  
  try {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString('lv-LV')}, ${date.toLocaleTimeString('lv-LV', TIME_FORMAT_OPTIONS)}`;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date/time';
  }
}

/**
 * Standardize booking status to handle both 'cancelled' and 'canceled' spellings
 * @param status The booking status to standardize
 * @returns standardized status string
 */
export function standardizeBookingStatus(status: string): 'pending' | 'confirmed' | 'cancelled' | 'completed' {
  // Handle the spelling variants
  if (status === 'canceled') {
    return 'cancelled';
  }
  
  // For all other statuses, validate and return
  if (['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return status as 'pending' | 'confirmed' | 'cancelled' | 'completed';
  }
  
  // Default to pending if unknown status
  console.warn(`Unknown booking status: ${status}, defaulting to 'pending'`);
  return 'pending';
}

/**
 * Check if a booking is cancelled (handles both spellings)
 * @param status Booking status
 * @returns boolean indicating if the booking is cancelled
 */
export function isBookingCancelled(status: string): boolean {
  return status === 'cancelled' || status === 'canceled';
}

// Cenas formatēšana
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Cena nav norādīta';
  return `${amount.toFixed(2)} €`;
} 