import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProf();

    if (!profile) {
      return new NextResponse("Unauthorized: Profile not found", {
        status: 401,
      });
    }

    // Validate input data
    if (!name || typeof name !== "string" || name.trim() === "") {
      return new NextResponse("Invalid server name", { status: 400 });
    }
    if (imageUrl && typeof imageUrl !== "string") {
      return new NextResponse("Invalid image URL", { status: 400 });
    }

    const inviteCode = uuidv4();

    const server = await db.$transaction(async (tx) => {
      const createdServer = await tx.server.create({
        data: {
          profileId: profile.id,
          name,
          imageUrl,
          inviteCode,
          channels: {
            create: [{ name: "general", profileId: profile.id }],
          },
          members: {
            create: [{ profileId: profile.id, role: MemberRole.ADMIN }],
          },
        },
      });

      // Fetch only necessary fields for response
      return tx.server.findUnique({
        where: { id: createdServer.id },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          inviteCode: true,
          channels: {
            select: {
              id: true,
              name: true,
            },
          },
          members: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });
    });

    return NextResponse.json(server);
  } catch (error) {
    console.error("[SERVERS_POST]", error); // Use console.error for errors
    return new NextResponse("Internal Error", { status: 500 });
  }
}
