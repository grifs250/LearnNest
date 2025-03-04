import { LocalBookingStatus } from '@/features/bookings/types';

export function getStatusBadgeClass(status: LocalBookingStatus): string {
  switch (status) {
    case 'confirmed': return 'badge-success';
    case 'cancelled': return 'badge-error';
    case 'canceled': return 'badge-error';
    case 'completed': return 'badge-info';
    case 'pending': 
    default:
      return 'badge-warning';
  }
}

export function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) return '€0.00';
  return `€${price.toFixed(2)}`;
}

export function formatDuration(minutes?: number | null): string {
  if (minutes === undefined || minutes === null) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} h`;
  } else {
    return `${hours} h ${mins} min`;
  }
}

export function getTimeRange(startTime: string, duration: number): string {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('lv', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isTimeInPast(dateTime: string): boolean {
  const now = new Date();
  const time = new Date(dateTime);
  return time < now;
} 