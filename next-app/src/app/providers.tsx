"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { wagmiConfig } from "@/wagmi.config"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  // Create theme for RainbowKit
  const theme = darkTheme({
    accentColor: "#14B8A6",
  })

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
