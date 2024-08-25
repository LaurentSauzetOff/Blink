import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

// Fonction pour vérifier les autorisations d'un utilisateur pour un serveur donné
async function checkUserPermissions(
  serverId: string,
  profileId: string
): Promise<boolean> {
  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profileId,
          role: {
            in: [MemberRole.MODERATOR, MemberRole.ADMIN],
          },
        },
      },
    },
  });

  return !!server; // Renvoie true si le serveur est trouvé avec les permissions nécessaires
}

export async function POST(req: Request) {
  try {
    const profile = await currentProf();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Channel name cannot be 'general'", {
        status: 400,
      });
    }

    const hasPermission = await checkUserPermissions(serverId, profile.id);
    if (!hasPermission) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const server = await db.server.update({
      where: { id: serverId },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNELS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
