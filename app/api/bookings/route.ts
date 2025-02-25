import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase/client';
// Check if the admin file exists and import it correctly
// import { adminFunction } from '@/lib/firebase/admin'; // Uncomment and correct if needed

export async function POST(req: NextRequest) {
  try {
    const { vacancyId, studentId } = await req.json();

    if (!vacancyId || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await supabase.from("vacancies").update({ bookedBy: studentId }).eq("id", vacancyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error booking vacancy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
