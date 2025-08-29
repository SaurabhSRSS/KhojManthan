// app/api/files/[name]/route.ts
import { NextResponse } from "next/server";
import { recentFiles } from "../../../../lib/store";

// Keep it simple: don't type the 2nd arg to avoid Next 15 type mismatch.
export async function GET(_req: Request, { params }: any) {
  const name = params?.name;
  if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });

  const file = recentFiles.find((f) => f.name === name);
  if (!file) return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });

  return NextResponse.json({ ok: true, file });
}

export async function DELETE(_req: Request, { params }: any) {
  const name = params?.name;
  if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });

  const idx = recentFiles.findIndex((f) => f.name === name);
  if (idx === -1) return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });

  recentFiles.splice(idx, 1);
  return NextResponse.json({ ok: true });
      }
