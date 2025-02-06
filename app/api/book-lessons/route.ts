import { NextResponse } from "next/server";
import { createGoogleCalendarEvent } from "@/lib/googleCalendar";
import { db } from "@/lib/firebaseClient";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { teacherEmail, studentEmail, subject, startTime, vacancyId } = await req.json();

    // Create Google Calendar Event
    const event = await createGoogleCalendarEvent(teacherEmail, studentEmail, subject, startTime);
    
    // Update Firestore with booked student
    const vacancyRef = doc(db, "vacancies", vacancyId);
    await updateDoc(vacancyRef, { students: arrayUnion(studentEmail) });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    const err = error as Error; // Cast 'error' to an Error object
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
