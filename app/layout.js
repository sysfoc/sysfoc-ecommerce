import { Inter } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import Header from "./components/Header";
import Footerr from "./components/Footerr";
import { DarkModeProvider } from "./context/DarkModeProvider";
import EmailVerificationBanner from "./components/email-verification-banner"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Ecommerce Auth",
  description: "Minimal ecommerce authentication system",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} bg-white dark:bg-gray-900 dark:text-gray-300 text-black transition-colors duration-300`}
      >
        <DarkModeProvider>
          <Header />
          <Suspense fallback={null}>
          <EmailVerificationBanner />
            {children}
          </Suspense>
          <Analytics />
          <Footerr />
        </DarkModeProvider>
      </body>
    </html>
  );
}
