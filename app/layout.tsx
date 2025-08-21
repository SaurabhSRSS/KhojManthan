import "./globals.css";
import type { Metadata } from "next";
<<<<<<< HEAD
import type { ReactNode } from "react";
=======
import Header from "@/components/Header";
import Footer from "@/components/Footer";
>>>>>>> be76705 (feat(ui): homepage + dashboard + header/footer + styles)

export const metadata: Metadata = {
  title: "KhojManthan",
  description: "SRSS | India's First Indigenous File Search Engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji",
        }}
      >
        {children}
=======
      <body>
        <Header />
        <main className="container">{children}</main>
        <Footer />
>>>>>>> be76705 (feat(ui): homepage + dashboard + header/footer + styles)
      </body>
    </html>
  );
          }
