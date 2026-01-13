import type { Metadata } from "next";
import { Noto_Serif_JP, Reggae_One } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const reggaeOne = Reggae_One({
  variable: "--font-reggae-one",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "サイコロ振りましょ！1人で遊ぶ1.2.3",
  description: "Play Dice 1-2-3 (Cee-lo) alone with beautiful effects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSerifJP.variable} ${reggaeOne.variable} antialiased bg-[#0a0e17] text-white overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
