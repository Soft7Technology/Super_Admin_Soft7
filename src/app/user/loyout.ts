import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin",
  description: "Super Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0c10",
          color: "#e8eaf0",
        }}
      >
        {children}
      </body>
    </html>
  );
}