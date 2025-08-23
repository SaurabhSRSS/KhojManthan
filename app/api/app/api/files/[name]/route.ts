import { NextResponse } from "next/server";

// GET /api/files/[name]
export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  const { name } = params;
  return NextResponse.json({
    ok: true,
    file: name,
    message: `Details for file "${name}" will come from storage soon.`,
  });
  }
