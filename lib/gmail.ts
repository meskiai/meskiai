import { google } from "googleapis";
import { prisma } from "./prisma";

export async function getGmailClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "google",
    },
  });

  if (!account || !account.access_token) {
    throw new Error("Brak dostępu do konta Google lub brak odpowiednich tokenów. Zaloguj się ponownie.");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: (account.expires_at || 0) * 1000,
  });

  // Automatyczne odświeżanie i zapisywanie tokenu, jeśli się zmienił
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
        },
      });
    } else if (tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
        },
      });
    }
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  return gmail;
}

export async function sendEmail(
  userId: string,
  to: string,
  subject: string,
  body: string,
  threadId?: string,
  inReplyToMessageId?: string
) {
  const gmail = await getGmailClient(userId);

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
  ];

  if (inReplyToMessageId) {
    // Odpowiadamy na konkretną wiadomość
    messageParts.push(`In-Reply-To: ${inReplyToMessageId}`);
    messageParts.push(`References: ${inReplyToMessageId}`);
  }

  const message = messageParts.join("\n") + "\n\n" + body;

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
      threadId: threadId,
    },
  });
}

export async function trashThread(userId: string, threadId: string) {
  const gmail = await getGmailClient(userId);
  await gmail.users.threads.trash({
    userId: "me",
    id: threadId,
  });
}
