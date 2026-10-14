import "@/styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { modeBootstrapScript } from "@/theme/bootstrap";
import { brandBootstrapScript } from "@/theme/colors";

export const metadata: Metadata = {
  title: "Soft7 Super Admin ",
  description: "Soft7 Super Admin Panel",
  icons: {
    icon: "/logo-light.png",
    shortcut: "/logo-light.png",
    apple: "/logo-light.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Cascade-layer order must be declared before ANY stylesheet loads:
            component CSS chunks can arrive before globals.css, and the first
            @layer mention fixes precedence for the whole document. */}
        <style dangerouslySetInnerHTML={{ __html: "@layer theme, base, components, utilities;" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        {/* Applies light/dark before first paint (same key/default as ThemeContext) */}
        <script dangerouslySetInnerHTML={{ __html: modeBootstrapScript }} />
        {/* Restores the saved brand color / Theme Editor overrides before first paint */}
        <script dangerouslySetInnerHTML={{ __html: brandBootstrapScript }} />
      </head>

      <body style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
