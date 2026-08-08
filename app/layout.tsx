import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import Image from "next/image";
import { agency } from "@/config/agency";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Montserrat({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: `${agency.name} · Dashboard`,
  description: agency.tagline,
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <head>
        <style
          // Colores de marca definidos en config/agency.ts, expuestos como variables CSS.
          dangerouslySetInnerHTML={{
            __html: `:root{--brand-primary:${agency.colors.primary};--brand-secondary:${agency.colors.secondary};--brand-accent:${agency.colors.accent};--color-bg:${agency.colors.background};--color-surface:${agency.colors.surface};--color-text:${agency.colors.text};--color-text-strong:${agency.colors.textStrong};--color-text-muted:${agency.colors.textMuted};--color-border:${agency.colors.border};}`,
          }}
        />
      </head>
      <body className="bg-paper text-ink antialiased">
        {children}
        <Image
          src="/images/logo-web-header.png"
          alt={agency.name}
          width={72}
          height={72}
          className="fixed bottom-4 right-4 z-50 h-16 w-16 object-contain drop-shadow-md sm:h-[4.5rem] sm:w-[4.5rem]"
        />
      </body>
    </html>
  );
}
