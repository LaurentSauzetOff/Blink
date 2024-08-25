import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProf();

    // Vérifie si le profil est authentifié
    if (!profile) {
      return new NextResponse("Unauthorized: Profile not found", {
        status: 401,
      });
    }

    // Vérifie si l'ID du serveur est présent
    if (!params.serverId) {
      return new NextResponse("Bad Request: Server ID missing", {
        status: 400,
      });
    }

    // Met à jour le code d'invitation du serveur
    const updatedServer = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });

    // Retourne le serveur mis à jour
    return NextResponse.json({
      message: "Invite code updated successfully",
      server: updatedServer,
    });
  } catch (error) {
    console.error("[SERVERS_PATCH]", error);
    return new NextResponse("Internal error: Could not update invite code", {
      status: 500,
    });
  }
}
