import { NextResponse } from "next/server";
import { Message, Prisma } from "@prisma/client"; // Importer Prisma

import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await currentProf();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor")?.trim();
    const channelId = searchParams.get("channelId")?.trim();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    // Ajouter une validation pour vérifier que channelId est un UUID valide
    if (!isValidUUID(channelId)) {
      return new NextResponse("Invalid Channel ID", { status: 400 });
    }

    let messages: Message[] = [];

    const messageQueryOptions = {
      take: MESSAGES_BATCH,
      where: { channelId },
      include: {
        member: {
          include: {
            profile: {
              select: { id: true, name: true }, // Limiter les champs récupérés pour optimiser la requête
            },
          },
        },
      },
      orderBy: { createdAt: "desc" as Prisma.SortOrder }, // Correction ici
    };

    if (cursor) {
      messages = await db.message.findMany({
        ...messageQueryOptions,
        skip: 1,
        cursor: { id: cursor },
      });
    } else {
      messages = await db.message.findMany(messageQueryOptions);
    }

    let nextCursor = null;
    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error) {
    console.error("[MESSAGES_GET]", error); // Utiliser console.error pour les erreurs
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Fonction utilitaire pour valider l'UUID
function isValidUUID(uuid: string) {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}
