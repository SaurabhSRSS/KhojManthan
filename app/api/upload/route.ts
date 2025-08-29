// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { KMFile } from "@/lib/store";

const LIST_KEY = "km:files";               // Redis list key
const MAX_FILES_TO_KEEP = 50;              // storage me kitne recent rakhne

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ ok: false, error: "No files provided" }, { status: 400 });
    }

    const allowed = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    ];
    const max = 10 * 1024 * 1024; // 10 MB

    const accepted: KMFile[] = [];
    const rejected: any[] = [];

    for (const f of files) {
      const okType = allowed.includes(f.type);
      const okSize = f.size <= max;

      if (okType && okSize) {
        const entry: KMFile = {
          name: f.name,
          size: f.size,
          type: f.type,
          uploadedAt: new Date().toISOString(),
        };
        // list ke head par push
        await kv.lpush(LIST_KEY, JSON.stringify(entry));
        accepted.push(entry);
      } else {
        rejected.push({ name: f.name, reason: !okType ? "type" : "size" });
      }
    }

    // list ko trim kar do taaki badi na ho
    await kv.ltrim(LIST_KEY, 0, MAX_FILES_TO_KEEP - 1);

    // latest 10 return karo
    const raw = await kv.lrange<string>(LIST_KEY, 0, 9);
    const recent = raw.map((s) => JSON.parse(s) as KMFile);

    return NextResponse.json({ ok: true, files: recent, accepted, rejected });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Upload failed" }, { status: 500 });
  }
  }
