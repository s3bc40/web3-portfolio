"use client";

import React, { useState } from "react";

/**
 * DonateClient component
 * @description Handles the interactive parts of the donation page, including state management
 * and simulated donation logic. This is a client-side component.
 * @returns {JSX.Element} The rendered client-side donation form and messages.
 */
export default function DonateClient() {
  // State for donation amount input
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Simulate loading state

  // Simulate a donation process
  const handleDonate = () => {
    if (donationAmount === "" || parseFloat(donationAmount) <= 0) {
      setMessage("Please enter a valid donation amount.");
      return;
    }

    setIsProcessing(true);
    setMessage("Processing your donation...");

    // Simulate an asynchronous donation process (e.g., API call, form submission)
    setTimeout(() => {
      setIsProcessing(false);
      setMessage(
        `Thank you for your generous donation of ${donationAmount} ETH!`,
      );
      setDonationAmount(""); // Clear input after donation
    }, 2000); // Simulate a 2-second delay
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-xl border-2 border-gray-700 bg-gray-800 p-8 shadow-2xl">
      <h1 className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-4xl font-extrabold text-transparent">
        Support My Work
      </h1>
      <p className="text-center text-lg text-gray-300">
        Help me continue building awesome decentralized applications!
      </p>

      <div className="flex w-full flex-col items-center gap-6">
        {/* Simulated contract balance display */}
        <div className="text-md text-center md:text-lg">
          <p className="text-gray-400">Total Donations Received (Simulated):</p>
          <p className="text-2xl font-bold text-green-400">0.00 ETH</p>
        </div>

        <input
          type="number"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          placeholder="Amount (ETH)"
          min="0.001"
          step="0.001"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <button
          onClick={handleDonate}
          disabled={isProcessing}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Donate ETH"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-yellow-400">{message}</p>
        )}
      </div>
    </div>
  );
}
