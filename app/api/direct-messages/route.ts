import { NextResponse } from "next/server";
import { DirectMessage } from "@prisma/client";
import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";

const MESSAGES_BATCH = 10;

// Fonction pour valider les paramètres de requête
function validateQueryParams(
  cursor: string | null,
  conversationId: string | null
): { isValid: boolean; message?: string } {
  if (!conversationId) {
    return { isValid: false, message: "Conversation ID is missing" };
  }
  if (cursor && typeof cursor !== "string") {
    return { isValid: false, message: "Invalid cursor format" };
  }
  return { isValid: true };
}

// Fonction pour récupérer les messages
async function fetchMessages(
  conversationId: string,
  cursor?: string
): Promise<DirectMessage[]> {
  const queryOptions: any = {
    take: MESSAGES_BATCH,
    where: {
      conversationId,
    },
    include: {
      member: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  if (cursor) {
    queryOptions.skip = 1;
    queryOptions.cursor = { id: cursor };
  }

  return db.directMessage.findMany(queryOptions);
}

export async function GET(req: Request) {
  try {
    const profile = await currentProf();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    const validation = validateQueryParams(cursor, conversationId);
    if (!validation.isValid) {
      return new NextResponse(validation.message, { status: 400 });
    }

    const messages = await fetchMessages(conversationId!, cursor || undefined);

    let nextCursor = null;
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.log("[MESSAGES_GET_CONVERSATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
