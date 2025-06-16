"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContracts } from "wagmi";
import { parseEther, formatEther } from "viem"; // For converting ETH to wei and vice-versa
import { FUND_ME_ABI, ZKTOKEN_ABI } from "@/utils/abis";
import useContractByChain from "@/utils/useContractByChain";

/**
 * DonateClient component
 * @description Handles the interactive parts of the donation page, including state management
 * and actual blockchain interaction for donations.
 * @returns {JSX.Element} The rendered client-side donation form and dashboard.
 */
export default function DonateClient() {
  // State variables for managing donation input and messages
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "ZK">("ETH");
  const [message, setMessage] = useState<string>("");

  // Get FundMe contract and ZK token contract addresses
  const { fundMeContractAddress, zkTokenContractAddress } =
    useContractByChain();

  // Wagmi hooks for account management
  const { address, isConnected } = useAccount();

  // Wagmi hooks for writing to the contract
  const { writeContract, isPending, isSuccess, isError, error, reset } =
    useWriteContract();

  // Wagmi hooks for reading from the contract
  const {
    data: contractReadData,
    isFetched,
    isLoading: isReadingContract,
    refetch: refetchContractData,
  } = useReadContracts({
    contracts: [
      {
        address: fundMeContractAddress,
        abi: FUND_ME_ABI,
        functionName: "balance_of_eth",
      },
      {
        address: fundMeContractAddress,
        abi: FUND_ME_ABI,
        functionName: "balance_of_zk_token",
      },
      {
        address: fundMeContractAddress,
        abi: FUND_ME_ABI,
        functionName: "get_funder_eth_amount",
        args: [address || "0x0000000000000000000000000000000000000000"], // Pass connected address
      },
      {
        address: fundMeContractAddress,
        abi: FUND_ME_ABI,
        functionName: "get_funder_zk_token_amount",
        args: [address || "0x0000000000000000000000000000000000000000"], // Pass connected address
      },
      {
        address: fundMeContractAddress,
        abi: FUND_ME_ABI,
        functionName: "get_minimal_funding_amount",
      },
    ],
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds to keep data updated
    },
  });

  const totalEthDonations = contractReadData?.[0]?.result
    ? formatEther(contractReadData[0].result as bigint)
    : "0.00";
  const totalZkDonations = contractReadData?.[1]?.result
    ? formatEther(contractReadData[1].result as bigint)
    : "0.00";
  const yourEthDonations = contractReadData?.[2]?.result
    ? formatEther(contractReadData[2].result as bigint)
    : "0.00";
  const yourZkDonations = contractReadData?.[3]?.result
    ? formatEther(contractReadData[3].result as bigint)
    : "0.00";
  const minimalFundingAmount = contractReadData?.[4]?.result
    ? formatEther(contractReadData[4].result as bigint)
    : "0.0001";

  // New state to manage the transaction status explicitly
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (isPending) {
      setTransactionStatus("pending");
      setMessage(`Processing your ${selectedToken} donation...`);
    } else if (isSuccess) {
      setTransactionStatus("success");
      setMessage(
        `Thank you for your generous donation of ${donationAmount} ${selectedToken}!`,
      );
      setDonationAmount(""); // Clear input after donation
      refetchContractData(); // Refetch contract data to update balances
      reset(); // THIS IS THE KEY CHANGE: Reset the wagmi write hook state
    } else if (isError) {
      setTransactionStatus("error");
      setMessage(`Donation failed: ${error?.message}`);
      reset(); // THIS IS ALSO KEY: Reset on error as well
    }
    // No explicit dependency on 'donationAmount' or 'selectedToken' here for the message,
    // as it might cause flickering or incorrect messages if they change while a tx is pending.
    // The message is set based on the state *before* the transaction completes.
  }, [
    isPending,
    isSuccess,
    isError,
    error,
    donationAmount,
    selectedToken,
    refetchContractData,
    reset,
  ]);

  /**
   * Handles the donation submission.
   * Validates the input, checks contract addresses, and initiates the donation transaction.
   *
   * @param {React.FormEvent} e - The form submission event.
   * @returns {Promise<void>}
   * @description This function is called when the user submits the donation form.
   */
  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();

    if (donationAmount === "" || parseFloat(donationAmount) <= 0) {
      setMessage("Please enter a valid donation amount.");
      return;
    }

    setMessage(`Processing your ${selectedToken} donation...`);

    const amountInWei = parseEther(donationAmount);

    // Validate contract addresses
    if (!fundMeContractAddress) {
      setMessage(
        "FundMe contract address is not set. Please check your configuration.",
      );
      return;
    }
    if (!zkTokenContractAddress) {
      setMessage(
        "ZK token contract address is not set. Please check your configuration.",
      );
      return;
    }

    // Validate minimal funding amount
    if (amountInWei < parseEther(minimalFundingAmount)) {
      setMessage(
        `Minimum donation amount is ${minimalFundingAmount} ${selectedToken}.`,
      );
      return;
    }

    try {
      // If donating ETH, call the fund_eth function
      if (selectedToken === "ETH") {
        writeContract({
          address: fundMeContractAddress,
          abi: FUND_ME_ABI,
          functionName: "fund_eth",
          value: amountInWei,
        });
      } else {
        // If donating ZK tokens, approve the contract first
        // Approve the contract to spend ZK tokens on behalf of the user.
        await writeContract({
          address: zkTokenContractAddress,
          abi: ZKTOKEN_ABI,
          functionName: "approve",
          args: [fundMeContractAddress, amountInWei],
        });

        // Then call the fund_zk_token function
        writeContract({
          address: fundMeContractAddress,
          abi: FUND_ME_ABI,
          functionName: "fund_zk_token",
          args: [amountInWei],
        });
      }
    } catch (err) {
      // This catch block will only catch errors that happen *before* the transaction is sent to the wallet (e.g., validation, hook setup issues).
      // Actual transaction failures (e.g., user rejects, out of gas) are handled by the isError flag from useWriteContract.
      setMessage(`Error preparing transaction: ${(err as Error).message}`);
      setTransactionStatus("error"); // Set status to error for client-side errors
      reset(); // Reset if there's an immediate error before transaction send
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      {/* Connect wallet message */}
      {!isConnected && (
        <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-xl border-2 border-gray-700 bg-gray-800 p-8 shadow-2xl">
          <h1 className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-4xl font-extrabold text-transparent">
            Connect Wallet
          </h1>
          <p className="text-center text-lg text-yellow-400">
            Please connect your wallet to make a donation and view your
            dashboard.
          </p>
        </div>
      )}

      {/* Donation form and dashboard */}
      {isConnected && (
        <div className="max-w-6xlxl grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          {/* Donation Block */}
          <div className="flex flex-col items-center gap-8 rounded-xl border-2 border-gray-700 bg-gray-800 p-8 shadow-2xl">
            <h1 className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-4xl font-extrabold text-transparent">
              Support My Work
            </h1>
            <p className="text-center text-lg text-gray-300">
              Help me continue building awesome decentralized applications!
            </p>

            <form
              onSubmit={handleDonate}
              className="flex w-full flex-col items-center gap-6"
            >
              <div className="text-md text-center md:text-lg">
                <p className="text-gray-400">Minimal Donation Amount:</p>
                <p className="text-xl font-bold text-green-400">
                  {minimalFundingAmount} ETH/ZK
                </p>
              </div>

              <div className="flex w-full justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedToken("ETH")}
                  className={`rounded-lg px-4 py-2 font-semibold ${
                    selectedToken === "ETH"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Donate ETH
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedToken("ZK")}
                  className={`rounded-lg px-4 py-2 font-semibold ${
                    selectedToken === "ZK"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  Donate ZK
                </button>
              </div>

              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder={`Amount (${selectedToken})`}
                min={minimalFundingAmount}
                step="0.001"
                required
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label={`Donation amount in ${selectedToken}`}
              />

              <button
                type="submit"
                disabled={isPending || transactionStatus === "pending"}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending || transactionStatus === "pending"
                  ? "Processing..."
                  : `Donate ${selectedToken}`}
              </button>

              {message && (
                <p
                  className="mt-4 text-center text-sm text-yellow-400"
                  role="alert"
                >
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* Dashboard Block */}
          <div className="flex flex-col items-center gap-8 rounded-xl border-2 border-gray-700 bg-gray-800 p-8 shadow-2xl">
            <h2 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
              Donation Dashboard
            </h2>
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
                Failed to load dashboard data. Please ensure contract address
                and ABI are correct.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
