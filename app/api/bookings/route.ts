import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { vacancyId, studentId } = await req.json();

    if (!vacancyId || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await adminDb.collection("vacancies").doc(vacancyId).update({ bookedBy: studentId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error booking vacancy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
