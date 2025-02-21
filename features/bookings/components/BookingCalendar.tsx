import { useRouter } from "next/navigation";
import { getUserProfile } from '@/lib/supabase/auth';
import { useSupabase } from '@/lib/supabase';

interface BookingCalendarProps {
  lessonId: string;
  teacherId: string;
  subject: string;
}

export function BookingCalendar({ lessonId, teacherId, subject }: Readonly<BookingCalendarProps>) {
  const router = useRouter();
  const { user } = useSupabase();

  const handleBooking = async (timeSlot: string) => {
    if (!user) {
      alert('Lai rezervētu nodarbību, lūdzu piesakieties');
      router.push('/auth?mode=login');
      return;
    }

    if (!user.emailVerified) {
      alert('Lai rezervētu nodarbību, lūdzu apstipriniet savu e-pasta adresi');
      router.push('/verify-email');
      return;
    }

    try {
      // Proceed with booking only if verified
      console.log(`Booking lesson ${lessonId} with teacher ${teacherId} for ${subject}`);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Kļūda rezervējot nodarbību. Lūdzu mēģiniet vēlreiz.');
    }
  };

  return (
    <div>
      <button onClick={() => handleBooking('some-time-slot')}>Book {subject} Lesson</button>
    </div>
  );
} 