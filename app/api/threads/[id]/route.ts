import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const threadId = resolvedParams.id;

    // Verify ownership
    const thread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!thread || thread.userId !== session.user.id) {
      return NextResponse.json({ error: "Thread not found or unauthorized" }, { status: 404 });
    }

    // Delete thread from DB (emails cascade delete via Prisma relation)
    await prisma.thread.delete({
      where: { id: threadId }
    });

    return NextResponse.json({ message: "Thread deleted successfully" });
  } catch (error: any) {
    console.error("Delete thread error:", error);
    return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 });
  }
}
