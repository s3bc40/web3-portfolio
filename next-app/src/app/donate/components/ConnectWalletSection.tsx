// src/components/ConnectWalletSection.tsx
import React from "react";

/**
 * ConnectWalletSection Component
 * Displays a message prompting the user to connect their wallet.
 * This is shown when no wallet is connected.
 */
export default function ConnectWalletSection() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-xl border-2 border-gray-700 bg-gray-800 p-8 shadow-2xl">
      <h1 className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-4xl font-extrabold text-transparent">
        Connect Wallet
      </h1>
      <p className="text-center text-lg text-yellow-400">
        Please connect your wallet to make a donation and view your dashboard.
      </p>
    </div>
  );
}
