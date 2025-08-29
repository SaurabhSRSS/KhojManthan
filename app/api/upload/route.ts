import { NextRequest, NextResponse } from "next/server";
import { recentFiles, KMFile } from "../../../lib/store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, error: "No files provided" }, { status: 400 });
    }

    const accepted: KMFile[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        rejected.push(`${file.name} (too large)`);
        continue;
      }

      accepted.push({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      });
    }

    recentFiles.push(...accepted);
    return NextResponse.json({ ok: true, accepted, rejected });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
        }
