import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;
  const studentId = formData.get("studentId") as string | null;

  if (!file || !studentId)
    return NextResponse.json({ error: "Missing file or studentId" }, { status: 400 });

  // Validate file type
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type))
    return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });

  // Max 5MB
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `student_${studentId}_${Date.now()}.${ext}`;

  // Save to public/uploads/students/
  const uploadDir = path.join(process.cwd(), "public", "uploads", "students");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  const photoUrl = `/uploads/students/${fileName}`;

  // Update DB
  await pool.query(
    "UPDATE fmstudents SET photo_url = $1 WHERE student_id = $2",
    [photoUrl, Number(studentId)]
  );

  return NextResponse.json({ photoUrl });
}
