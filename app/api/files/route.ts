// app/api/files/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import type { KMFile } from "@/lib/store";

const LIST_KEY = "km:files";

export async function GET() {
  const raw = await kv.lrange<string>(LIST_KEY, 0, 9); // latest 10
  const files = raw.map((s) => JSON.parse(s) as KMFile);
  return NextResponse.json({ ok: true, files });
}

// ?name=<fileName> se delete
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });

  // list read, matching JSON string find, then LREM
  const raw = await kv.lrange<string>(LIST_KEY, 0, -1);
  let removed = false;

  for (const s of raw) {
    const f = JSON.parse(s) as KMFile;
    if (f.name === name && !removed) {
      await kv.lrem(LIST_KEY, 1, s); // first match remove
      removed = true;
    }
  }

  return NextResponse.json({ ok: true, removed });
                         }
