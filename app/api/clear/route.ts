import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    return NextResponse.json({ success: true, message: "Cleared all accounts and sessions." });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
