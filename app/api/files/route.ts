import { NextResponse } from "next/server";
import { recentFiles } from "@/lib/store";

export async function GET() {
  // list all recent files
  return NextResponse.json({ ok: true, files: recentFiles });
}
