import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Load credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

// Initialize OAuth2 client
const auth = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI);
auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: "v3", auth });

export async function createGoogleCalendarEvent(
  teacherEmail: string,
  studentEmail: string,
  subject: string,
  startTime: string
) {
  try {
    // Refresh token to get a new access token
    const { token } = await auth.getAccessToken();
    if (!token) throw new Error("Failed to get access token.");
    auth.setCredentials({ access_token: token });

    const event = {
      summary: `Nodarbība: ${subject}`,
      description: `Tiešsaistes nodarbība starp ${teacherEmail} un ${studentEmail}.`,
      start: { dateTime: startTime, timeZone: "Europe/Riga" },
      end: {
        dateTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: "Europe/Riga",
      },
      attendees: [{ email: teacherEmail }, { email: studentEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      auth,
      calendarId: "primary",
      requestBody: event, // 🔹 Correct Type
      conferenceDataVersion: 1,
    });

    return response.data; // 🔹 Fix for .data issue
  } catch (error) {
    console.error("Google Calendar API Error:", error);
    throw new Error("Failed to create Google Calendar event.");
  }
}
