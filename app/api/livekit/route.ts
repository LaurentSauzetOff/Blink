import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Récupération et validation des paramètres de requête
  const room = req.nextUrl.searchParams.get("room")?.trim();
  const username = req.nextUrl.searchParams.get("username")?.trim();

  if (!room) {
    return NextResponse.json(
      { error: 'Missing "room" query parameter' },
      { status: 400 }
    );
  }

  if (!username) {
    return NextResponse.json(
      { error: 'Missing "username" query parameter' },
      { status: 400 }
    );
  }

  // Vérification de la configuration de l'environnement
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured. Please check environment variables." },
      { status: 500 }
    );
  }

  try {
    // Génération du jeton d'accès avec les privilèges appropriés
    const accessToken = new AccessToken(apiKey, apiSecret, {
      identity: username,
    });

    accessToken.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = accessToken.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[LIVEKIT_TOKEN_GENERATION_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error while generating token" },
      { status: 500 }
    );
  }
}
