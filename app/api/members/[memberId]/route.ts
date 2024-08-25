import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Supprimer un membre
export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProf();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId")?.trim();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    // Vérifie si l'utilisateur a les droits nécessaires avant de supprimer
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          deleteMany: {
            id: params.memberId,
            profileId: {
              not: profile.id, // Empêche de se supprimer soi-même
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: {
              select: { id: true, name: true }, // Récupère uniquement les champs nécessaires
            },
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[MEMBERS_ID_DELETE]", error); // Utilise console.error pour les erreurs
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Mettre à jour le rôle d'un membre
export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProf();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId")?.trim();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    // Vérifie le rôle avant de mettre à jour
    const validRoles = ["ADMIN", "MODERATOR", "MEMBER"]; // Exemple de rôles valides
    if (!validRoles.includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              profileId: {
                not: profile.id, // Empêche de se modifier soi-même
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: {
              select: { id: true, name: true }, // Récupère uniquement les champs nécessaires
            },
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[MEMBERS_ID_PATCH]", error); // Utilise console.error pour les erreurs
    return new NextResponse("Internal Error", { status: 500 });
  }
}
