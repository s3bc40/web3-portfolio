import type { Metadata } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "@/app/providers";
import { Roboto } from "next/font/google";
import Navbar from "@/ui/Navbar";
import Footer from "@/ui/Footer";

// Font imports
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  preload: false,
});

export const metadata: Metadata = {
  title: "s3bc40 portfolio",
  description: "Welcome to my portfolio website",
};

/**
 * Layout component for the entire application.
 * @param {React.ReactNode} children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The layout component.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="bg-gray-900">
        {/* Providers for Web3 configs */}
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
