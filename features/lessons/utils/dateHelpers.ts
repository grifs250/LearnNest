export const dateHelpers = {
  formatLessonTime(date: string, time: string): string {
    return new Date(`${date}T${time}`).toLocaleString('lv-LV', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  isTimeSlotAvailable(timeSlot: string, workHours: any, bookedTimes: any): boolean {
    const date = new Date(timeSlot);
    const dayOfWeek = date.getDay();
    const timeString = date.toTimeString().slice(0, 5);
    
    // Check work hours
    const daySchedule = workHours[dayOfWeek];
    if (!daySchedule?.enabled) return false;
    
    // Check if slot is already booked
    return !bookedTimes[timeSlot];
  }
}; 