// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "geist/font/sans";
import { Geist_Mono } from "geist/font/mono";

export const metadata: Metadata = {
  title: "KhojManthan",
  description: "India’s First Indigenous File Search Engine",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${Geist.variable} ${Geist_Mono.variable}`}>
        {children}
      </body>
    </html>
  );
        }
