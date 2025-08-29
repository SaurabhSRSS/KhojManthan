// app/api/files/[name]/route.ts
import { NextResponse } from "next/server";
import { recentFiles } from "@/lib/store";

// GET: abhi simple—list hi de dega (param ignore)
// /api/files/anything -> { files: [...] }
export async function GET(
  _req: Request,
  _ctx: { params: { name: string } }
) {
  return NextResponse.json({ ok: true, files: recentFiles });
}

// DELETE: /api/files/<name>  -> given name ko list se hata dega
export async function DELETE(
  _req: Request,
  ctx: { params: { name: string } }
) {
  const name = ctx.params?.name;
  if (!name) {
    return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });
  }

  const idx = recentFiles.findIndex((f) => f.name === name);
  if (idx > -1) {
    recentFiles.splice(idx, 1);
  }

  return NextResponse.json({ ok: true });
}
