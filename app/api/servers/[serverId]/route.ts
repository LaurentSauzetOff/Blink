import { currentProf } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProf();
        const { name, imageUrl } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized: Profile not found", { status: 401 });
        }

        // Validate input data
        if (name && typeof name !== "string") {
            return new NextResponse("Invalid name", { status: 400 });
        }
        if (imageUrl && typeof imageUrl !== "string") {
            return new NextResponse("Invalid image URL", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id
            },
            data: {
                name: name ?? undefined, // Only update if provided
                imageUrl: imageUrl ?? undefined // Only update if provided
            }
        });

        return NextResponse.json(server);
    } catch (error) {
        console.error("[SERVER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProf();

        if (!profile) {
            return new NextResponse("Unauthorized: Profile not found", { status: 401 });
        }

        const server = await db.server.delete({
            where: {
                id: params.serverId,
                profileId: profile.id
            }
        });

        // Return a confirmation message
        return NextResponse.json({ message: "Server deleted successfully" });
    } catch (error) {
        console.error("[SERVER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}