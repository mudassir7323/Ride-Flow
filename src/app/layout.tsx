import type { Metadata } from "next";
import { Merriweather_Sans, Roboto_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const merriweatherSans = Merriweather_Sans({
  variable: "--font-merriweather",
  weight: ["600"],
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RideFlow",
  description: "Ride-hailing platform for DB Systems Lab project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${merriweatherSans.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
