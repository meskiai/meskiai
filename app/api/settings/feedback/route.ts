import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { sendReplySMTP } from "../../../../lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stars, comment } = await req.json();

    if (typeof stars !== "number" || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Nieprawidłowa ocena. Dozwolone 1-5 gwiazdek." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user to mark feedback as submitted so it never triggers again
    await prisma.user.update({
      where: { id: session.user.id },
      data: { feedbackSubmitted: true }
    });

    // Attempt to send email to miloszmeski@icloud.com using user's SMTP credentials if configured
    if (user.email && user.settings?.appPassword) {
      try {
        await sendReplySMTP(
          user.email,
          user.settings.appPassword,
          "miloszmeski@icloud.com",
          `[MESKIAI Feedback] Nowa opinia (${stars}/5) od ${user.email}`,
          `Użytkownik: ${user.email}\nOcena: ${stars} / 5 gwiazdek\n\nOpinia:\n${comment || "(brak opisu)"}`
        );
        console.log(`[Feedback] Wysłano opinię użytkownika ${user.email} na miloszmeski@icloud.com`);
      } catch (emailError: any) {
        console.error(`[Feedback] Błąd podczas wysyłania maila SMTP z opinią:`, emailError.message);
        // We still return success since feedbackSubmitted was updated in the DB
      }
    } else {
      console.warn(`[Feedback] Brak połączonego SMTP dla ${user.email}. Nie można wysłać maila, ale opinia została oznaczona jako przesłana.`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
