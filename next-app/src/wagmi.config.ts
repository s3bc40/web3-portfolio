import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    anvil,
    sepolia,
    zksyncSepoliaTestnet,
    mainnet,
    zksync
} from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
    appName: 'Portfolio Web3',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [
        anvil,
        mainnet,
        zksync,
        zksyncSepoliaTestnet,
        sepolia
    ],
    ssr: true,
});
