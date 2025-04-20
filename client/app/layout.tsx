import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
import { decodeJWT } from "./utils/token";
import { ReduxProvider } from "./libs/redux/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Messaging App",
  description: "A messenger-like application built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await decodeJWT();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#2e2f2f]`}>
        <ReduxProvider>
          <div className="flex h-screen w-full">
            <Sidebar token={token} />
            <main className="flex-1 pr-4 py-4 overflow-auto">{children}</main>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}

