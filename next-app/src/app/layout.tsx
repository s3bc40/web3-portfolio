import type { Metadata } from "next"
import "./globals.css"

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
      <body>{children}</body>
    </html>
  )
}
