export const BUFFER_TIMES = {
  CANCEL: 24, // hours before lesson
  RESCHEDULE: 48 // hours before lesson
};

export function canCancelLesson(lessonTime: string): boolean {
  const lessonDate = new Date(lessonTime);
  const now = new Date();
  const hoursUntilLesson = (lessonDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilLesson >= BUFFER_TIMES.CANCEL;
}

export function canRescheduleLesson(lessonTime: string): boolean {
  const lessonDate = new Date(lessonTime);
  const now = new Date();
  const hoursUntilLesson = (lessonDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilLesson >= BUFFER_TIMES.RESCHEDULE;
} 