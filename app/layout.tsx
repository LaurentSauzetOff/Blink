// Importer les styles globaux et les types nécessaires
import "./globals.css";
import type { Metadata } from "next";

// Importer les polices, providers et fonctions utilitaires
import { Open_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SocketProvider } from "@/components/providers/socket-provide";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/model-provider";
import { cn } from "@/lib/utils";

// Configuration de la police Open Sans
const font = Open_Sans({ subsets: ["latin"] });

// Définition des métadonnées de la page
export const metadata: Metadata = {
  title: "ChatCord",
  description: "Discord-clone",
  icons: {
    icon: "https://discord.com/favicon.ico",
  },
};

// Composant racine de la mise en page
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn(font.className, "bg-white dark:bg-[#313338]")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            storageKey="discord-theme"
          >
            <SocketProvider>
              <ModalProvider />
              <QueryProvider>{children}</QueryProvider>
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
