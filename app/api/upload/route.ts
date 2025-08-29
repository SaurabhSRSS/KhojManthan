import { NextResponse } from "next/server";
import { recentFiles, KMFile } from "@/lib/store";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files provided" }, { status: 400 });
  }

  for (const f of files) {
    const meta: KMFile = {
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedAt: new Date().toISOString(),
    };
    recentFiles.push(meta);
  }

  return NextResponse.json({ ok: true, files: recentFiles });
}
