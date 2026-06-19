import type { Metadata } from "next";
import { Providers } from "./providers";


export const metadata: Metadata = { title: "Super Admin | Soft7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body
  style={{
    margin: 0,
    padding: 0,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    fontSize: "15px",
  }}
>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
