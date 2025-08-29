import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: any) {
  const name = params?.name ?? "unknown";
  return NextResponse.json({ ok: true, name });
}
