import { NextResponse } from "next/server";

// This endpoint has been disabled for security reasons.
// It was a development utility that deleted all accounts/sessions without authentication.
export async function GET() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
