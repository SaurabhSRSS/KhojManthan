import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    name: file.name,
    size: file.size,
    type: file.type,
  });
}
