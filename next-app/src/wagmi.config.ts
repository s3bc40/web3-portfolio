import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
    cookieStorage,
    createStorage
} from 'wagmi';
import {
    anvil,
    zksyncSepoliaTestnet,
    zksync
} from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
    appName: 'Portfolio Web3',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [
        anvil,
        zksync,
        zksyncSepoliaTestnet,
    ],
    transports: {
        // Transport configuration for each chain
        // @dev If the environment variable is not set, it will use the default transport
        [anvil.id]: http(process.env.NEXT_ANVIL_RPC_URL || undefined),
        [zksync.id]: http(process.env.NEXT_ALCHEMY_ZKSYNC_MAINNET_RPC_URL || undefined),
        [zksyncSepoliaTestnet.id]: http(process.env.NEXT_ALCHEMY_ZKSYNC_SEPOLIA_RPC_URL || undefined),
    },
    ssr: true,
    // Persistence using Cookies
    storage: createStorage({
        storage: cookieStorage,
    }),
});
