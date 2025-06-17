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
        // @dev not using custom RPC URLs, but in real-world applications, you would replace `http()` with your custom RPC URLs.
        //    Since it is client-side, we would need to use a proxy to avoid exposing the RPC URLs.
        [anvil.id]: http(),
        [zksyncSepoliaTestnet.id]: http(),
    },
    ssr: true,
    // Persistence using Cookies
    storage: createStorage({
        storage: cookieStorage,
    }),
}) as Config; // @dev Type assertion to ensure the config is of type Config