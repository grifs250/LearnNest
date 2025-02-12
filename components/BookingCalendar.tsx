import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface BookingCalendarProps {
  lessonId: string;
  teacherId: string;
  subject: string;
}

export default function BookingCalendar({ lessonId, teacherId, subject }: BookingCalendarProps) {
  const router = useRouter();

  const handleBooking = async (timeSlot: string) => {
    if (!auth.currentUser) {
      alert("Lai rezervētu nodarbību, lūdzu piesakieties");
      router.push('/auth?mode=login');
      return;
    }

    if (!auth.currentUser.emailVerified) {
      alert("Lai rezervētu nodarbību, lūdzu apstipriniet savu e-pasta adresi");
      router.push('/verify-email');
      return;
    }

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (!userDoc.exists() || userDoc.data().status !== 'active') {
      alert("Jūsu konts nav aktīvs. Lūdzu apstipriniet savu e-pastu.");
      router.push('/verify-email');
      return;
    }

    try {
      // Verify again right before booking
      const verifiedUser = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (!verifiedUser.exists() || 
          !verifiedUser.data().emailVerified || 
          verifiedUser.data().status !== 'active') {
        alert("Lai rezervētu nodarbību, lūdzu apstipriniet savu e-pastu");
        router.push('/verify-email');
        return;
      }

      // Proceed with booking only if verified
      // Use the props in the booking logic
      console.log(`Booking lesson ${lessonId} with teacher ${teacherId} for ${subject}`);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Kļūda rezervējot nodarbību. Lūdzu mēģiniet vēlreiz.");
    }
  };

  return (
    <div>
      <button onClick={() => handleBooking("some-time-slot")}>
        Book {subject} Lesson
      </button>
    </div>
  );
} 