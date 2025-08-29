import { NextResponse } from "next/server";
import { recentFiles } from "../../../lib/store";

export async function GET() {
  return NextResponse.json({ ok: true, files: recentFiles });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });
  }

  const idx = recentFiles.findIndex((f) => f.name === name);
  if (idx > -1) recentFiles.splice(idx, 1);

  return NextResponse.json({ ok: true });
}
