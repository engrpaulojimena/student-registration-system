import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";

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
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

const result = await new Promise<any>((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "students",
      public_id: `student_${studentId}_${Date.now()}`,
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  );

  stream.end(buffer);
});

const photoUrl = result.secure_url;


  // Update DB
  await pool.query(
    "UPDATE fmstudents SET photo_url = $1 WHERE student_id = $2",
    [photoUrl, Number(studentId)]
  );

  return NextResponse.json({ photoUrl });
}
