import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Encoreify",
  description: "Turn concert programmes into Spotify playlists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 antialiased min-h-screen flex flex-col`}>
        <header className="w-full p-6 flex justify-center border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Encoreify
          </h1>
        </header>
        <main className="flex-1 flex flex-col items-center p-6 sm:p-12 w-full max-w-3xl mx-auto">
          <Providers>{children}</Providers>
        </main>
        <footer className="p-6 text-center space-y-2 text-zinc-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Encoreify</p>
          <p>
            If you like this app, consider <a href="https://buymeacoffee.com/temporalny" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">buying me a coffee</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
