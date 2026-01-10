import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "America Screener",
  description: "Real-time token tracker for america.fun launches on Solana. Track new tokens, copy CA for trading, and monitor the bonding curve.",
  keywords: ["america.fun", "solana", "token tracker", "dexscreener", "crypto", "memecoins"],
  openGraph: {
    title: "AmericaScreener | Track America.fun Token Launches",
    description: "Real-time token tracker for america.fun launches on Solana",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmericaScreener",
    description: "Track america.fun token launches on Solana",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
