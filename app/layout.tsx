import "./globals.css";
import type { ReactNode, Metadata } from "react";

export const metadata: Metadata = {
  title: "KhojManthan",
  description: "SRSS Search Engine Project",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji" }}>
        {children}
      </body>
    </html>
  );
}
