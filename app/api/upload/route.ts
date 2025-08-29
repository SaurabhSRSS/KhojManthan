// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { recentFiles, KMFile } from "@/lib/store";

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files found" }, { status: 400 });
  }

  // allowlist + limits
  const allowed = new Set([
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ]);
  const MAX = 10 * 1024 * 1024; // 10 MB

  const accepted: KMFile[] = [];
  const rejected: { name: string; reason: string }[] = [];

  for (const f of files) {
    const okType = allowed.has(f.type);
    const okSize = f.size <= MAX;

    if (okType && okSize) {
      const meta: KMFile = {
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
      };
      // newest first
      recentFiles.unshift(meta);
      accepted.push(meta);
    } else {
      rejected.push({
        name: f.name,
        reason: !okType ? "type" : "size",
      });
    }
  }

  return NextResponse.json({ ok: true, accepted, rejected });
}
