import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import NavigationProgress from "@/components/NavigationProgress";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sign Language",
  description: "AI-powered sign language translation for inclusive communication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="preload" href="/avatar.glb" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans">
        <Providers>
          <LanguageProvider>
            <DarkModeProvider>
              <NavigationProgress />
              {children}
            </DarkModeProvider>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
