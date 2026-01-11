import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";

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
    images: [
      {
        url: '/ai-eagle-eye.png',
        width: 1200,
        height: 630,
        alt: 'America Screener - Token Analytics Dashboard',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AmericaScreener",
    description: "Track america.fun token launches on Solana",
    images: ['/ai-eagle-eye.png'],
  },
  icons: {
    icon: '/favicon.ico?v=3',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=3" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" type="image/x-icon" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
