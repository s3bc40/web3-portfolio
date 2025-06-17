"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContracts,
  useWatchBlockNumber,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { FUND_ME_ABI, ZKTOKEN_ABI } from "@/utils/abis";
import useContractByChain from "@/utils/useContractByChain";
import { anvil } from "wagmi/chains";

// Import the new components
import ConnectWalletSection from "@/app/donate/components/ConnectWalletSection";
import DonationForm from "@/app/donate/components/DonationForm";
import DashboardSection from "@/app/donate/components/DashboardSection";

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
  const { address, isConnected, chain } = useAccount();

  // State to track if the specific Anvil chain is active
  const [isAnvilActive, setIsAnvilActive] = useState(false);
  // State to manage whether useWatchBlockNumber should be enabled for polling
  const [shouldWatchBlocks, setShouldWatchBlocks] = useState(false);

  // This will try to enable the block watcher only when connected and on the Anvil chain.
  // It also sets `isAnvilActive` to false if we disconnect or switch chains.
  useEffect(() => {
    const isOnAnvil = isConnected && chain?.id === anvil.id;
    setShouldWatchBlocks(isOnAnvil);
    if (!isOnAnvil) {
      setIsAnvilActive(false); // Reset if not on Anvil or disconnected
    }
  }, [isConnected, chain]);

  // --- useWatchBlockNumber for Anvil activity detection ---
  useWatchBlockNumber({
    onBlockNumber() {
      // If we get any block number while connected to Anvil, it's active.
      if (chain?.id === anvil.id) {
        setIsAnvilActive(true);
      } else {
        // This case should ideally be caught by the `enabled` prop.
        setIsAnvilActive(false);
      }
    },
    onError(error) {
      // This will fire if the RPC call fails (e.g., Anvil is not running)
      console.error("useWatchBlockNumber error:", error); // Keep this for debugging *actual* errors
      setIsAnvilActive(false); // Mark as inactive on error
    },
    // Only enable if connected AND we are specifically targeting the Anvil chain
    enabled: shouldWatchBlocks,
    // Add a polling interval. Wagmi internally uses `watchBlockNumber` which polls.
    pollingInterval: 2000, // Check every 2 seconds
  });

  // --- Write Contracts ---
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApproveWriting, // isPending when wallet interaction is active
    isSuccess: isApproveTxSent, // isSuccess when tx sent to network (before confirmation)
    isError: isApproveWriteError,
    error: approveWriteError,
    reset: resetApproveWrite,
  } = useWriteContract();

  const {
    writeContract: writeFundZk,
    data: fundZkTxHash,
    isPending: isFundZkWriting,
    isSuccess: isFundZkTxSent,
    isError: isFundZkWriteError,
    error: fundZkWriteError,
    reset: resetFundZkWrite,
  } = useWriteContract();

  const {
    writeContract: writeFundEth,
    data: fundEthTxHash,
    isPending: isFundEthWriting,
    isSuccess: isFundEthTxSent,
    isError: isFundEthWriteError,
    error: fundEthWriteError,
    reset: resetFundEthWrite,
  } = useWriteContract();

  // --- Transaction Receipts (Confirmation) ---
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    isError: isApproveConfirmError,
    error: approveConfirmError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    query: {
      enabled: !!approveTxHash,
    },
  });

  const {
    isLoading: isFundZkConfirming,
    isSuccess: isFundZkConfirmed,
    isError: isFundZkConfirmError,
    error: fundZkConfirmError,
  } = useWaitForTransactionReceipt({
    hash: fundZkTxHash,
    query: {
      enabled: !!fundZkTxHash,
    },
  });

  const {
    isLoading: isFundEthConfirming,
    isSuccess: isFundEthConfirmed,
    isError: isFundEthConfirmError,
    error: fundEthConfirmError,
  } = useWaitForTransactionReceipt({
    hash: fundEthTxHash,
    query: {
      enabled: !!fundEthTxHash,
    },
  });

  // --- Read Contracts ---
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
      {
        address: zkTokenContractAddress,
        abi: ZKTOKEN_ABI,
        functionName: "allowance",
        args: [
          address || "0x0000000000000000000000000000000000000000",
          fundMeContractAddress || "0x0000000000000000000000000000000000000000",
        ],
      }, // Read allowance for ZK token
    ],
    query: {
      enabled:
        isConnected &&
        !!fundMeContractAddress &&
        (chain?.id !== anvil.id || isAnvilActive),
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const [
    totalEthDonations,
    totalZkDonations,
    yourEthDonations,
    yourZkDonations,
    minimalFundingAmount,
  ] = useMemo(() => {
    const results =
      contractReadData?.map((d) => d?.result) || Array(5).fill(BigInt(0)); // Array size needs to be 6 now
    return [
      formatEther((results[0] as bigint) || BigInt(0)),
      formatEther((results[1] as bigint) || BigInt(0)),
      formatEther((results[2] as bigint) || BigInt(0)),
      formatEther((results[3] as bigint) || BigInt(0)),
      formatEther((results[4] as bigint) || BigInt(0)),
    ];
  }, [contractReadData]);

  // --- ZK Token Approval and Donation Flow ---
  useEffect(() => {
    // Stage 1: Approval transaction sent to network
    if (isApproveTxSent && !isApproveConfirming && !isApproveConfirmed) {
      setMessage(`ZK approval transaction sent. Waiting for confirmation...`);
    }
    // Stage 2: Approval confirmed on-chain
    else if (isApproveConfirmed) {
      // Set message to indicate approval success and initiate donation
      setMessage("ZK token approved! Initiating donation...");
      const amountInWei = parseEther(donationAmount);
      writeFundZk({
        address: fundMeContractAddress!,
        abi: FUND_ME_ABI,
        functionName: "fund_zk_token",
        args: [amountInWei],
      });
      // Reset approval state immediately to clean up for next potential use
      resetApproveWrite();
      refetchContractData(); // IMPORTANT: Refetch after approval to update allowance
    }
    // Stage 3: Error during approval write or confirmation
    else if (isApproveWriteError || isApproveConfirmError) {
      setMessage(
        `ZK approval failed: ${approveWriteError?.message || approveConfirmError?.message || "Transaction reverted."}`,
      );
      resetApproveWrite(); // Reset error state
    }
  }, [
    isApproveTxSent,
    isApproveConfirming,
    isApproveConfirmed,
    isApproveWriteError,
    isApproveConfirmError,
    approveWriteError,
    approveConfirmError,
    donationAmount,
    fundMeContractAddress,
    writeFundZk,
    resetApproveWrite,
    refetchContractData, // Added refetchContractData to dependencies
  ]);

  // --- ZK Token Fund Donation Flow (after approval or if allowance was sufficient) ---
  useEffect(() => {
    // Stage 1: Donation transaction sent to network
    if (isFundZkTxSent && !isFundZkConfirming && !isFundZkConfirmed) {
      setMessage(`ZK donation transaction sent. Waiting for confirmation...`);
    }
    // Stage 2: Donation confirmed on-chain
    else if (isFundZkConfirmed) {
      setMessage(
        `Thank you for your generous donation of ${donationAmount} ZK!`,
      );
      setDonationAmount(""); // Clear input after donation
      refetchContractData(); // Refetch contract data to update balances
      resetFundZkWrite(); // Reset donation state
    }
    // Stage 3: Error during donation write or confirmation
    else if (isFundZkWriteError || isFundZkConfirmError) {
      setMessage(
        `ZK donation failed: ${
          fundZkWriteError?.message ||
          fundZkConfirmError?.message ||
          "Transaction reverted."
        }`,
      );
      resetFundZkWrite(); // Reset error state
    }
  }, [
    isFundZkTxSent,
    isFundZkConfirming,
    isFundZkConfirmed,
    isFundZkWriteError,
    isFundZkConfirmError,
    fundZkWriteError,
    fundZkConfirmError,
    donationAmount,
    refetchContractData,
    resetFundZkWrite,
  ]);

  // --- ETH Donation Flow ---
  useEffect(() => {
    // Stage 1: Donation transaction sent to network
    if (isFundEthTxSent && !isFundEthConfirming && !isFundEthConfirmed) {
      setMessage(`ETH donation transaction sent. Waiting for confirmation...`);
    }
    // Stage 2: Donation confirmed on-chain
    else if (isFundEthConfirmed) {
      setMessage(
        `Thank you for your generous donation of ${donationAmount} ETH!`,
      );
      setDonationAmount(""); // Clear input after donation
      refetchContractData(); // Refetch contract data to update balances
      resetFundEthWrite(); // Reset donation state
    }
    // Stage 3: Error during donation write or confirmation
    else if (isFundEthWriteError || isFundEthConfirmError) {
      setMessage(
        `ETH donation failed: ${
          fundEthWriteError?.message ||
          fundEthConfirmError?.message ||
          "Transaction reverted."
        }`,
      );
      resetFundEthWrite(); // Reset error state
    }
  }, [
    isFundEthTxSent,
    isFundEthConfirming,
    isFundEthConfirmed,
    isFundEthWriteError,
    isFundEthConfirmError,
    fundEthWriteError,
    fundEthConfirmError,
    donationAmount,
    refetchContractData,
    resetFundEthWrite,
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

    // Clear any existing messages on new submission attempt
    setMessage("");

    // Validate contract addresses
    if (!fundMeContractAddress) {
      setMessage(
        "FundMe contract address is not set. Please check your configuration.",
      );
      return;
    }
    if (selectedToken === "ZK" && !zkTokenContractAddress) {
      setMessage(
        "ZK token contract address is not set. Please check your configuration.",
      );
      return;
    }

    if (donationAmount === "" || parseFloat(donationAmount) <= 0) {
      setMessage("Please enter a valid donation amount.");
      return;
    }

    // Validate minimal funding amount
    const amountInWei = parseEther(donationAmount);
    if (amountInWei < parseEther(minimalFundingAmount)) {
      setMessage(
        `Minimum donation amount is ${minimalFundingAmount} ${selectedToken}.`,
      );
      return;
    }

    try {
      // If donating ETH, call the fund_eth function
      if (selectedToken === "ETH") {
        setMessage("Awaiting ETH donation confirmation in your wallet...");
        writeFundEth({
          address: fundMeContractAddress,
          abi: FUND_ME_ABI,
          functionName: "fund_eth",
          value: amountInWei,
        });
      } else {
        // If donating ZK tokens, first check allowance
        setMessage("Awaiting ZK token approval in your wallet...");
        writeApprove({
          address: zkTokenContractAddress!,
          abi: ZKTOKEN_ABI,
          functionName: "approve",
          args: [fundMeContractAddress!, amountInWei],
        });
      }
    } catch (err) {
      // This catch block will only catch errors that happen *before* the transaction is sent to the wallet (e.g., validation, hook setup issues).
      setMessage(`Error preparing transaction: ${(err as Error).message}`);
    }
  }

  // --- Dynamic Button Text & Disabled State ---
  const getButtonText = () => {
    // Prioritize showing transaction progress
    if (isApproveWriting) return "Confirming Approval...";
    if (isApproveConfirming) return "Approving ZK...";
    if (isFundZkWriting) return "Confirming ZK Donation...";
    if (isFundZkConfirming) return "Donating ZK...";
    if (isFundEthWriting) return "Confirming ETH Donation...";
    if (isFundEthConfirming) return "Donating ETH...";

    // If ZK selected and allowance is insufficient, suggest approve & donate
    if (selectedToken === "ZK") {
      return "Approve ZK & Donate";
    }

    // Default button text
    return `Donate ${selectedToken}`;
  };

  const isButtonDisabled =
    isApproveWriting ||
    isApproveConfirming ||
    isFundZkWriting ||
    isFundZkConfirming ||
    isFundEthWriting ||
    isFundEthConfirming ||
    (shouldWatchBlocks && !isAnvilActive); // Disable if Anvil is not active

  return (
    <div className="top-6 mt-32 flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white md:mt-0">
      {/* General Disclaimer */}
      <div className="mb-8 max-w-2xl rounded-lg bg-yellow-700 p-4 text-center text-yellow-100 shadow-md">
        <p className="mb-2 text-lg font-semibold">Important Disclaimer:</p>
        <p className="text-sm">
          This contract code is currently unaudited and for demonstration
          purposes only. It is deployed on the{" "}
          <strong>ZK Sepolia testnet</strong> (or local Anvil for dev), NOT on
          the ZK mainnet. Do not use real funds.
        </p>
      </div>

      {/* Connect wallet message */}
      {!isConnected && <ConnectWalletSection />}

      {/* Donation form and dashboard */}
      {isConnected && (
        <div className="max-w-6xlxl grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          {/* Donation Block */}
          <DonationForm
            donationAmount={donationAmount}
            setDonationAmount={setDonationAmount}
            selectedToken={selectedToken}
            setSelectedToken={setSelectedToken}
            message={message}
            handleDonate={handleDonate}
            minimalFundingAmount={minimalFundingAmount}
            getButtonText={getButtonText}
            isButtonDisabled={isButtonDisabled}
          />

          {/* Dashboard Block */}
          <DashboardSection
            chain={chain}
            anvilId={anvil.id}
            isAnvilActive={isAnvilActive}
            isReadingContract={isReadingContract}
            isFetched={isFetched}
            totalEthDonations={totalEthDonations}
            totalZkDonations={totalZkDonations}
            yourEthDonations={yourEthDonations}
            yourZkDonations={yourZkDonations}
          />
        </div>
      )}
    </div>
  );
}
