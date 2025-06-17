"use client";

import React from "react";

// Define props interface for clarity and type safety
interface DonationFormProps {
  donationAmount: string;
  setDonationAmount: (amount: string) => void;
  selectedToken: "ETH" | "ZK";
  setSelectedToken: (token: "ETH" | "ZK") => void;
  message: string;
  handleDonate: (e: React.FormEvent) => Promise<void>;
  minimalFundingAmount: string;
  getButtonText: () => string;
  isButtonDisabled: boolean;
}

/**
 * DonationForm Component
 * Renders the form for making donations (ETH or ZK tokens).
 * Receives all necessary data and event handlers as props from the parent.
 */
export default function DonationForm({
  donationAmount,
  setDonationAmount,
  selectedToken,
  setSelectedToken,
  message,
  handleDonate,
  minimalFundingAmount,
  getButtonText,
  isButtonDisabled,
}: DonationFormProps) {
  return (
    <div className="flex flex-col items-center gap-8 rounded-xl border-2 border-gray-700 bg-gray-800 p-8 shadow-2xl">
      <h1 className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-center text-4xl font-extrabold text-transparent">
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
            onClick={() => {
              setSelectedToken("ETH");
              setDonationAmount(""); // Clear amount on token change for clarity
              // Note: message reset is handled by handleDonate on submit, or can be added here if preferred on token change
            }}
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
            onClick={() => {
              setSelectedToken("ZK");
              setDonationAmount(""); // Clear amount on token change for clarity
              // Note: message reset is handled by handleDonate on submit, or can be added here if preferred on token change
            }}
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
          type="text"
          value={donationAmount}
          onChange={(e) => {
            setDonationAmount(e.target.value);
            // Note: message reset is handled by handleDonate on submit, or can be added here if preferred on input change
          }}
          placeholder={`Amount (${selectedToken})`}
          required
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label={`Donation amount in ${selectedToken}`}
        />

        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {getButtonText()}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-yellow-400" role="alert">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
