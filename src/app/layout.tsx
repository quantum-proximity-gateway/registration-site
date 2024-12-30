import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "@/components/ui/provider";

export const metadata: Metadata = {
  title: "Device Registration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
