import { NextResponse } from "next/server";
import { recentFiles } from "../../../lib/store";

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files received" }, { status: 400 });
  }

  const allowed = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]; // PDF, TXT, DOCX
  const max = 10 * 1024 * 1024; // 10 MB

  const accepted: any[] = [];
  const rejected: any[] = [];

  for (const f of files) {
    const okType = allowed.includes(f.type);
    const okSize = f.size <= max;

    if (okType && okSize) {
      recentFiles.unshift({
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
      });
      if (recentFiles.length > 20) recentFiles.length = 20; // keep latest 20
      accepted.push({ name: f.name, size: f.size, type: f.type });
    } else {
      rejected.push({
        name: f.name,
        reason: !okType ? "type-not-allowed" : "size-too-large",
      });
    }
  }

  return NextResponse.json({ ok: true, accepted, rejected });
}
