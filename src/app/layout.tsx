import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "~/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Vent - 想いを綴る場所",
  description: "今日の想いを共有しよう",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon512_rounded.png"></link>
        <meta name="theme-color" content="#b8e986" />
      </head>
      <body
        className={`font-sans ${inter.variable} bg-gray-50 dark:bg-gray-900`}
      >
        <TRPCReactProvider>
          <Navbar />
          {children}
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
