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
import { anvil, zksyncSepoliaTestnet } from "wagmi/chains";

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
  // Constants for minting ZK tokens
  const MINT_COOLDOWN_SECONDS = 86400; // 24 hours in seconds
  const MINT_AMOUNT = parseEther("20"); // Amount of ZK tokens to mint (e.g., 1000)

  // State variables for managing donation input and messages
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "ZK">("ETH");
  const [message, setMessage] = useState<string>("");
  // Use state for `lastMintTime` but initialize and update with localStorage
  const [lastMintTime, setLastMintTime] = useState<number>(() => {
    if (typeof window !== "undefined") {
      // Check if window is defined (for SSR safety)
      const storedTime = localStorage.getItem("lastMintTime");
      return storedTime ? parseInt(storedTime, 10) : 0;
    }
    return 0;
  });

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

  // --- Mint Contract Write Hook ---
  const {
    writeContract: writeMint,
    data: mintTxHash,
    isPending: isMintWriting,
    isSuccess: isMintTxSent,
    isError: isMintWriteError,
    error: mintWriteError,
    reset: resetMintWrite,
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

  const {
    isLoading: isMintConfirming,
    isSuccess: isMintConfirmed,
    isError: isMintConfirmError,
    error: mintConfirmError,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
    query: {
      enabled: !!mintTxHash,
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
        functionName: "balanceOf", // Read ZK Token balance of the connected address
        args: [address || "0x0000000000000000000000000000000000000000"],
      },
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
      contractReadData?.map((d) => d?.result) || Array(6).fill(BigInt(0)); // Array size needs to be 6 now
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
      setMessage(`ZK approval failed`);
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
      setMessage(`ZK donation failed`);
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
      setMessage(`ETH donation failed`);
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

  // --- ZK Token Minting Flow ---
  useEffect(() => {
    if (isMintTxSent && !isMintConfirming && !isMintConfirmed) {
      setMessage(`Mint transaction sent. Waiting for confirmation...`);
    } else if (isMintConfirmed) {
      setMessage(`Successfully minted ${formatEther(MINT_AMOUNT)} ZK tokens!`);
      refetchContractData();
      resetMintWrite();
      setLastMintTime(Date.now()); // Update React state
      if (typeof window !== "undefined") {
        localStorage.setItem("lastMintTime", Date.now().toString()); // Persist to localStorage
      }
    } else if (isMintWriteError || isMintConfirmError) {
      setMessage(`Minting failed`);
      resetMintWrite();
    }
  }, [
    isMintTxSent,
    isMintConfirming,
    isMintConfirmed,
    isMintWriteError,
    isMintConfirmError,
    mintWriteError,
    mintConfirmError,
    refetchContractData,
    resetMintWrite,
    MINT_AMOUNT,
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

  /**
   * Handles minting of ZK mock tokens to the connected wallet.
   * Includes chain check and a simple cooldown mechanism.
   */
  async function handleMint() {
    setMessage("");

    if (!isConnected || !address) {
      setMessage("Please connect your wallet to mint tokens.");
      return;
    }

    if (chain?.id !== zksyncSepoliaTestnet.id) {
      setMessage("Please switch to zkSync Sepolia to mint test tokens.");
      return;
    }

    if (!zkTokenContractAddress) {
      setMessage("ZK token contract address is not configured.");
      return;
    }

    const now = Date.now();
    // Get last mint time from state, which is initialized from localStorage
    const storedLastMintTime = lastMintTime; // Use the state variable

    if (now - storedLastMintTime < MINT_COOLDOWN_SECONDS * 1000) {
      const remainingTime = Math.ceil(
        (MINT_COOLDOWN_SECONDS * 1000 - (now - storedLastMintTime)) / 1000,
      );
      setMessage(
        `Please wait ${remainingTime} seconds before minting again (24h cooldown).`,
      );
      return;
    }

    try {
      setMessage(
        `Awaiting mint confirmation in your wallet for ${formatEther(MINT_AMOUNT)} ZK...`,
      );
      writeMint({
        address: zkTokenContractAddress,
        abi: ZKTOKEN_ABI,
        functionName: "mint",
        args: [address, MINT_AMOUNT],
      });
    } catch (err) {
      setMessage(`Error preparing mint transaction: ${(err as Error).message}`);
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

  // Separate disabled state for the Mint button
  const isMintButtonDisabled = useMemo(() => {
    const isOnCooldown =
      Date.now() - lastMintTime < MINT_COOLDOWN_SECONDS * 1000;
    const isNotZkSepolia = isConnected && chain?.id !== zksyncSepoliaTestnet.id;

    return (
      isButtonDisabled || // Inherit general transaction pending states
      isOnCooldown ||
      isNotZkSepolia ||
      !zkTokenContractAddress || // Ensure token address is set
      !address // Ensure wallet is connected
    );
  }, [
    isButtonDisabled,
    lastMintTime,
    MINT_COOLDOWN_SECONDS,
    isConnected,
    chain?.id,
    zkTokenContractAddress,
    address,
  ]);

  return (
    <div className="mt-32 flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
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

      {/* Mint ZK Token Button Section */}
      {isConnected && chain?.id === zksyncSepoliaTestnet.id && (
        <div className="mt-8 w-full max-w-lg rounded-lg bg-gray-800 p-6 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Get Test ZK Tokens</h2>
          <p className="mb-4 text-sm text-gray-400">
            Click the button below to mint {formatEther(MINT_AMOUNT)} test ZK
            tokens to your connected wallet. This is available only on zkSync
            Sepolia and has a 24 hours cooldown.
          </p>
          <p className="mb-4 text-sm text-gray-400">
            You can use these tokens to test the ZK donation flow. They are not
            real tokens and have no value.
          </p>
          <p className="mb-4 text-left text-sm text-gray-400">
            Address: <strong>{zkTokenContractAddress}</strong>
            <br />
            Decimals: <strong>18</strong>
            <br />
            Symbol: <strong>MZK</strong>
          </p>
          <button
            onClick={handleMint}
            disabled={isMintButtonDisabled}
            className={`w-full rounded-md px-6 py-3 text-lg font-semibold transition-colors duration-200 ${
              isMintButtonDisabled
                ? "cursor-not-allowed bg-gray-600 text-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isMintWriting || isMintConfirming
              ? "Minting..."
              : isConnected && chain?.id !== zksyncSepoliaTestnet.id
                ? "Switch to zkSync Sepolia to Mint"
                : isMintButtonDisabled &&
                    Date.now() - lastMintTime < MINT_COOLDOWN_SECONDS * 1000
                  ? `Cooldown: ${Math.ceil((MINT_COOLDOWN_SECONDS * 1000 - (Date.now() - lastMintTime)) / 1000)}s`
                  : `Mint ${formatEther(MINT_AMOUNT)} ZK Tokens`}
          </button>
        </div>
      )}
    </div>
  );
}
