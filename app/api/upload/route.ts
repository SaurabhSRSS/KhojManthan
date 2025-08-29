import { NextResponse } from "next/server";
import { recentFiles, KMFile } from "../../../lib/store";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const allowed = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const max = 10 * 1024 * 1024; // 10 MB

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
      }
    }

    // final return from inside the handler
    return NextResponse.json({ ok: true, files: recentFiles });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Upload failed" },
      { status: 500 }
    );
  }
      }
