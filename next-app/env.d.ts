declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;
        NEXT_ANVIL_RPC_URL: string;
        NEXT_ALCHEMY_ZKSYNC_SEPOLIA_RPC_URL: string;
        NEXT_ALCHEMY_ZKSYNC_MAINNET_RPC_URL: string;
    }
}