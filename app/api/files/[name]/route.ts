import { NextRequest, NextResponse } from "next/server";
import { recentFiles } from "../../../../lib/store";

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const file = recentFiles.find(f => f.name === params.name);
  if (!file) return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
  return NextResponse.json({ ok: true, file });
}

export async function DELETE(_req: NextRequest, { params }: { params: { name: string } }) {
  const idx = recentFiles.findIndex(f => f.name === params.name);
  if (idx === -1) return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });

  recentFiles.splice(idx, 1);
  return NextResponse.json({ ok: true });
    }
