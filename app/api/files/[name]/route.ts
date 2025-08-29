import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  ctx: { params: { name: string } }
) {
  const name = ctx.params?.name || "unknown";
  return NextResponse.json({ ok: true, name });
}
