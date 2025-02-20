import { Lesson, BookingStatus } from "../types";

export const lessonHelpers = {
  getStatusBadge(status: BookingStatus): string {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-warning';
    }
  },

  formatLessonTime(date: string, time: string): string {
    return new Date(`${date}T${time}`).toLocaleString('lv-LV', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}; 