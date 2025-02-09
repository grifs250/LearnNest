import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useState } from 'react';
import { TeacherLesson } from '@/types/lesson';

interface LessonCalendarProps {
  readonly lessons: TeacherLesson[];
}

export function LessonCalendar({ lessons }: LessonCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Create a Set of dates that have lessons
  const lessonDates = new Set(
    lessons.map(lesson => lesson.date)
  );

  return (
    <DayPicker
      mode="single"
      selected={date}
      onSelect={setDate}
      modifiers={{
        hasLesson: (date) => lessonDates.has(
          date.toISOString().split('T')[0]
        )
      }}
      modifiersStyles={{
        hasLesson: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'white'
        }
      }}
    />
  );
} 