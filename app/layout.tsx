import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import TanstackProviders from "@/lib/tanstack-provider";
import { Toaster } from "sonner";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "jujurly",
  description: "jujurly is a chat application that allows you to chat with your friends and family",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", fontSans.variable, "font-sans", roboto.variable)}
    >
      <body className="min-h-full flex flex-col">
        <TanstackProviders>
          {children}
          <Toaster/>  
        </TanstackProviders>
      </body>
    </html>
  );
}
