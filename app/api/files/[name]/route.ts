import { NextResponse } from "next/server";
// optional: import type { NextRequest } from "next/server";

export async function GET(
  _req: Request, // or: _req: NextRequest
  { params }: { params: { name: string } }
) {
  const name = params?.name ?? "unknown";
  return NextResponse.json({ ok: true, name });
}
