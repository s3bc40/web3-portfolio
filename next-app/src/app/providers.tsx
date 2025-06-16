"use client";

import { useState, type ReactNode } from "react";
// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type State, WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import wagmiConfig from "@/wagmi.config";

type Props = {
  children: ReactNode;
  initialState: State | undefined; // Initial state for Wagmi, used for SSR hydration
};

export function Providers({ children, initialState }: Props) {
  const [queryClient] = useState(() => new QueryClient());

  // Create theme for RainbowKit
  const theme = darkTheme({
    accentColor: "#14B8A6",
  });

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
