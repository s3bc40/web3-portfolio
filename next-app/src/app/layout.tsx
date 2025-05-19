/**
 * Layout component for the entire application.
 * @param {React.ReactNode} children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The layout component.
 */

import type { Metadata } from "next"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { Providers } from "@/app/providers"
import Navbar from "@/ui/Navbar"
import { Roboto } from "next/font/google"

// Font imports
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "s3bc40 portfolio",
  description: "Welcome to my portfolio website",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="bg-gray-900">
        {/* Providers for Web3 configs */}
        <Providers>
          {/* Navbar */}
          <Navbar />
          {/* Main content */}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
