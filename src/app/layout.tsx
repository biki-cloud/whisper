import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";
import { Toaster } from "~/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Vent - 想いを綴る場所",
  description: "今日の想いを共有しよう",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icon512_rounded.png" },
  ],
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
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
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1 pb-16 md:pb-0 md:pt-16">
              <ServiceWorkerRegistration />
              {children}
            </div>
            <Footer />
          </div>
        </TRPCReactProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
