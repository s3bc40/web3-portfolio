"use client";

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
    Config,
    cookieStorage,
    createStorage
} from 'wagmi';
import {
    anvil,
    zksyncSepoliaTestnet,
} from 'wagmi/chains';

export default getDefaultConfig({
    appName: 'Portfolio Web3',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [
        anvil,
        zksyncSepoliaTestnet,
    ],
    transports: {
        // Transport configuration for each chain
        // @dev If the environment variable is not set, it will use the default transport
        [anvil.id]: http(process.env.NEXT_ANVIL_RPC_URL || undefined),
        [zksyncSepoliaTestnet.id]: http(process.env.NEXT_ALCHEMY_ZKSYNC_SEPOLIA_RPC_URL || undefined),
    },
    ssr: true,
    // Persistence using Cookies
    storage: createStorage({
        storage: cookieStorage,
    }),
}) as Config; // @dev Type assertion to ensure the config is of type Config