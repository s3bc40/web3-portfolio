import type { Metadata } from "next"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import Link from "next/link"
import AvatarBrandSvg from "@/ui/AvatarBrandSvg"
import { Providers } from "@/app/providers"
import { ConnectButton } from "@rainbow-me/rainbowkit"

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
    <html lang="en">
      <body className="bg-gray-900">
        {/* Providers for Web3 configs */}
        <Providers>
          {/* Navbar */}
          <nav className="flex w-full items-center justify-between gap-4 bg-gray-800 p-4">
            {/* Icon top left */}
            <Link href="/">
              <AvatarBrandSvg className="h-10 w-10 fill-white transition-colors hover:fill-yellow-500" />
            </Link>
            {/* Connect button wallet */}
            <ConnectButton />
          </nav>
          {/* Main content */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
