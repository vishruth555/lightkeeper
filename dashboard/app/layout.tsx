import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Zap } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lightkeeper Dashboard",
  description: "Lighthouse monitoring dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>
          <nav className="w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-black text-white">
                  <Zap size={16} fill="currentColor" />
                </div>
                <span className="text-base font-bold tracking-tight text-gray-900">Lightkeeper</span>
              </Link>
              <div className="flex items-center gap-4">
                 <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">v1.0</span>
              </div>
            </div>
          </nav>
          <main className="min-h-[calc(100vh-4rem)] bg-white px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}