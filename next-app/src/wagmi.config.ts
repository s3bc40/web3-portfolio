"use client";

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, HttpTransport } from 'viem';
import {
    Config,
    cookieStorage,
    createStorage
} from 'wagmi';
import {
    anvil,
    zksyncSepoliaTestnet,
    type Chain
} from 'wagmi/chains';

// Define your default chains that are always included (production and development)
const defaultChains: [Chain, ...Chain[]] = [
    zksyncSepoliaTestnet, // This is a public testnet, suitable for both dev and prod
];

// Conditionally add the Anvil chain only in development
if (process.env.NODE_ENV === 'development') {
    defaultChains.push(anvil);
}

// Helper function to create transports based on the chains array
const createTransports = (chains: Chain[]) => {
    const transports: { [key: number]: HttpTransport } = {};
    chains.forEach(chain => {
        // @dev use specific RPC URLs here in a real app,
        //    but for now, we'll stick to http(). Using proxy to avoid exposing
        //    RPC URLs in the client code.
        transports[chain.id] = http();
    });
    return transports;
};

export default getDefaultConfig({
    appName: 'Portfolio Web3',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: defaultChains,
    transports: createTransports(defaultChains),
    ssr: true,
    // Persistence using Cookies
    storage: createStorage({
        storage: cookieStorage,
    }),
}) as Config; // @dev Type assertion to ensure the config is of type Config