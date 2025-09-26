import type { Metadata } from "next";
import { Inter, Source_Code_Pro, PT_Sans } from "next/font/google";
import { FirebaseProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-headline",
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Incognito",
  description: "Receive anonymous questions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceCodePro.variable} ${ptSans.variable} dark`}>
      <body className="font-body">
        <FirebaseProvider>
          {children}
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
