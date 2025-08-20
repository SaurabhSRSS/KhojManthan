// app/layout.tsx
import "./globals.css";
import { Geist } from "geist/font/sans";
import { Geist_Mono } from "geist/font/mono";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KhojManthan",
  description: "India’s First Indigenous File Search Engine by SRSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${Geist.variable} ${Geist_Mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
