import { google } from "googleapis";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI!;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

// Initialize OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export async function createCalendarEvent(
  teacherEmail: string,
  studentEmail: string,
  subject: string,
  startTime: string
) {
  try {
    const event = {
      summary: `Lesson: ${subject}`,
      description: `Online lesson between ${teacherEmail} and ${studentEmail}.`,
      start: { dateTime: startTime, timeZone: "Europe/Riga" },
      end: { dateTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(), timeZone: "Europe/Riga" },
      attendees: [{ email: teacherEmail }, { email: studentEmail }],
      conferenceData: { createRequest: { requestId: `meet-${Date.now()}` } },
    };

    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event, // ✅ FIXED: Use "requestBody" instead of "resource"
      conferenceDataVersion: 1, // Enables Google Meet link
    });

    return createdEvent.data;
  } catch (error: any) {
    console.error("Google Calendar API Error:", error);
    throw new Error(error.message || "Failed to create Google Calendar event.");
  }
}
