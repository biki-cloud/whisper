import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { TRPCProvider } from "./providers";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Whisper - 想いを綴る場所",
  description: "匿名で想いを綴る場所",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`font-sans ${GeistSans.variable}`}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
