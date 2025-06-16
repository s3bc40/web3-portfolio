"use client";

import { contractAddresses } from "@/utils/constants";
import { useEffect, useState } from "react";
import { useChainId, useChains } from "wagmi";

/**
 * Custom hook to get contract addresses based on the current chain.
 * It retrieves the contract addresses for FundMe and ZkToken based on the current chain ID.
 * It uses environment variables to determine the contract addresses for each chain.
 *
 * @returns {Object} An object containing the contract addresses for FundMe and ZkToken.
 */
export default function useContractByChain() {
    // Setup state variables to hold contract addresses
    const [fundMeContractAddress, setFundMeContractAddress] = useState<`0x${string}` | undefined>(undefined);
    const [zkTokenContractAddress, setZkTokenContractAddress] = useState<`0x${string}` | undefined>(undefined);

    // Get the current chain ID and list of chains from wagmi
    const chainId = useChainId();
    const chains = useChains();

    // Effect to update contract addresses based on the current chain
    useEffect(() => {
        // Find the current chain entry in the memoized object
        const currentChainAddresses = contractAddresses[chainId as keyof typeof contractAddresses];

        if (currentChainAddresses) {
            setFundMeContractAddress(currentChainAddresses.fundMe as `0x${string}`);
            setZkTokenContractAddress(currentChainAddresses.zkToken as `0x${string}`);
        } else {
            setFundMeContractAddress(undefined);
            setZkTokenContractAddress(undefined);
        }
    }, [chainId, chains]);

    return { fundMeContractAddress, zkTokenContractAddress };
}