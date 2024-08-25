import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProf();

    if (!profile) {
      return new NextResponse("Unauthorized: Profile not found", {
        status: 401,
      });
    }

    if (!params.serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    // Find the server to ensure the member is part of it
    const server = await db.server.findFirst({
      where: {
        id: params.serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      return new NextResponse(
        "Server not found or member not part of the server",
        { status: 404 }
      );
    }

    // Remove the member from the server
    const updatedServer = await db.server.update({
      where: {
        id: params.serverId,
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Successfully left the server",
      server: updatedServer,
    });
  } catch (error) {
    console.error("[LEAVE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
