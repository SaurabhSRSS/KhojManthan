import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "No file received" }, { status: 400 });
    }

    // Note: abhi storage nahi; sirf meta return kar rahe
    const f = file as File;
    return NextResponse.json({
      ok: true,
      file: { name: f.name, size: f.size, type: f.type }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Upload failed" }, { status: 500 });
  }
}

export const runtime = "nodejs"; // keep on Node runtime
