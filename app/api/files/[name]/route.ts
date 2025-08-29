import { NextResponse } from "next/server";

export async function GET(_req: Request, context: any) {
  const name = context?.params?.name ?? "unknown";
  return NextResponse.json({ ok: true, name });
}
