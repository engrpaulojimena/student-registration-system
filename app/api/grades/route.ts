import { NextRequest, NextResponse } from "next/server";
import { upsertGrade } from "@/lib/grade";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { enrollmentSubjectId, prelimGrade, midtermGrade, finalGrade, remarks } = await req.json();

    if (!enrollmentSubjectId) {
      return NextResponse.json({ error: "enrollmentSubjectId required" }, { status: 400 });
    }

    const validRemarks = ["Passed", "Failed", "Incomplete", "In Progress", "Dropped"];
    if (!validRemarks.includes(remarks)) {
      return NextResponse.json({ error: "Invalid remarks value" }, { status: 400 });
    }

    const pre = prelimGrade  !== "" && prelimGrade  !== null && prelimGrade  !== undefined ? Number(prelimGrade)  : null;
    const mid = midtermGrade !== "" && midtermGrade !== null && midtermGrade !== undefined ? Number(midtermGrade) : null;
    const fin = finalGrade   !== "" && finalGrade   !== null && finalGrade   !== undefined ? Number(finalGrade)   : null;

    if (pre !== null && (pre < 0 || pre > 100)) {
      return NextResponse.json({ error: "Prelim grade must be 0–100" }, { status: 400 });
    }
    if (mid !== null && (mid < 0 || mid > 100)) {
      return NextResponse.json({ error: "Midterm grade must be 0–100" }, { status: 400 });
    }
    if (fin !== null && (fin < 0 || fin > 100)) {
      return NextResponse.json({ error: "Final grade must be 0–100" }, { status: 400 });
    }

    const resolvedRemarks = await upsertGrade(enrollmentSubjectId, pre, mid, fin, remarks);
    return NextResponse.json({ success: true, remarks: resolvedRemarks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
