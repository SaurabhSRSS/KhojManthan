import { NextResponse } from "next/server";
import { recentFiles } from "@/lib/store";

export async function GET(
  req: Request,
  context: { params: { name: string } }
) {
  const { name } = context.params;
  const file = recentFiles.find((f) => f.name === name);

  if (!file) {
    return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, file });
}
