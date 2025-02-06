import { NextResponse } from "next/server";
import { createGoogleCalendarEvent } from "@/lib/googleCalendar";
import { db } from "@/lib/firebaseClient";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export async function POST(req: Request) {
  const { teacherEmail, studentEmail, subject, startTime, vacancyId } = await req.json();

  try {
    // Create Google Calendar Event
    const event = await createGoogleCalendarEvent(teacherEmail, studentEmail, subject, startTime);
    
    // Update Firestore to store the booked student
    const vacancyRef = doc(db, "vacancies", vacancyId);
    await updateDoc(vacancyRef, { students: arrayUnion(studentEmail) });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

