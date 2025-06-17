// src/components/DashboardSection.tsx
import React from "react";
import { Chain } from "viem";

// Define props interface for clarity and type safety
interface DashboardSectionProps {
  chain: Chain | undefined;
  anvilId: number; // The ID of the Anvil chain
  isAnvilActive: boolean;
  isReadingContract: boolean;
  isFetched: boolean;
  totalEthDonations: string;
  totalZkDonations: string;
  yourEthDonations: string;
  yourZkDonations: string;
}

/**
 * DashboardSection Component
 * Displays the total donations, user's donations, and allowance.
 * Also shows status for Anvil chain connection.
 * Receives all necessary data as props from the parent.
 */
export default function DashboardSection({
  chain,
  anvilId,
  isAnvilActive,
  isReadingContract,
  isFetched,
  totalEthDonations,
  totalZkDonations,
  yourEthDonations,
  yourZkDonations,
}: DashboardSectionProps) {
  return (
    <div className="flex flex-col items-center gap-8 rounded-xl border-2 border-gray-700 bg-gray-800 p-8 shadow-2xl">
      <h2 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-center text-3xl font-extrabold text-transparent">
        Donation Dashboard
      </h2>
      {chain?.id === anvilId && !isAnvilActive && (
        <p className="text-yellow-400">
          Waiting for Anvil to start or connect to the correct chain (ID:{" "}
          {anvilId})...
        </p>
      )}
      {isReadingContract && (
        <p className="text-gray-400">Loading dashboard data...</p>
      )}
      {!isReadingContract && isFetched && (
        <div className="w-full space-y-4">
          <div className="text-center">
            <p className="text-lg text-gray-400">
              Total Donations Received (ETH):
            </p>
            <p className="text-3xl font-bold text-green-400">
              {totalEthDonations} ETH
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-400">
              Total Donations Received (ZK):
            </p>
            <p className="text-3xl font-bold text-green-400">
              {totalZkDonations} ZK
            </p>
          </div>
          <hr className="border-gray-600" />
          <div className="text-center">
            <p className="text-lg text-gray-400">Your ETH Donations:</p>
            <p className="text-2xl font-bold text-blue-400">
              {yourEthDonations} ETH
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-400">Your ZK Donations:</p>
            <p className="text-2xl font-bold text-teal-400">
              {yourZkDonations} ZK
            </p>
          </div>
        </div>
      )}
      {!isFetched && !isReadingContract && (
        <p className="text-red-400">
          Failed to load dashboard data. Please ensure contract address and ABI
          are correct.
        </p>
      )}
    </div>
  );
}
