import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

// Fonction pour vérifier les permissions de l'utilisateur pour un serveur donné
async function hasUserPermissions(
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
            in: [MemberRole.ADMIN, MemberRole.MODERATOR],
          },
        },
      },
    },
  });
  return !!server;
}

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProf();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    const hasPermission = await hasUserPermissions(serverId, profile.id);
    if (!hasPermission) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const channel = await db.channel.deleteMany({
      where: {
        id: params.channelId,
        serverId,
        name: { not: "general" }, // Protection pour empêcher la suppression de "general"
      },
    });

    if (channel.count === 0) {
      return new NextResponse("Channel not found or cannot be deleted", {
        status: 404,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProf();
    const { searchParams } = new URL(req.url);
    const { name, type } = await req.json();
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const hasPermission = await hasUserPermissions(serverId, profile.id);
    if (!hasPermission) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const channel = await db.channel.updateMany({
      where: {
        id: params.channelId,
        serverId,
        name: { not: "general" }, // Protection pour empêcher la mise à jour de "general"
      },
      data: {
        name,
        type,
      },
    });

    if (channel.count === 0) {
      return new NextResponse("Channel not found or cannot be updated", {
        status: 404,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[CHANNEL_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
