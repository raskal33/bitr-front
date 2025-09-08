import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia, type AppKitNetwork } from '@reown/appkit/networks'

// Monad Network configuration - CORRECT SETTINGS FOR MONAD TESTNET
export const monadNetwork: AppKitNetwork = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [
        'https://testnet-rpc.monad.xyz/',
        'https://rpc.ankr.com/monad_testnet',
        'https://frosty-summer-model.monad-testnet.quiknode.pro/bfedff2990828aad13692971d0dbed22de3c9783/'
      ],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet-explorer.monad.xyz' },
  },
  testnet: true,
}

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '6a0514d82fb621e41aa6cad5473883a3'

// Create the networks array
const networks = [monadNetwork, mainnet, sepolia] as [AppKitNetwork, ...AppKitNetwork[]]

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'BitRedict - Connect Wallet',
    description: 'Connect your wallet to access decentralized prediction markets on Monad Network',
    url: 'https://bitredict.vercel.app',
    icons: ['https://bitredict.vercel.app/logo.png'],
  },
  features: {
    analytics: false, // Disable analytics to remove Reown tracking
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'var(--font-onest), system-ui, sans-serif',
    '--w3m-accent': '#22C7FF',
    '--w3m-color-mix': '#22C7FF',
    '--w3m-color-mix-strength': 25,
    '--w3m-border-radius-master': '16px',
    '--w3m-z-index': 999999,
  },
  allWallets: 'HIDE',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
  // Improved connection settings
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: false, // Disable Coinbase for better performance
})

export const config = wagmiAdapter.wagmiConfig

// Contract addresses for smart contract integration - MONAD TESTNET DEPLOYMENT
export const CONTRACT_ADDRESSES = {
  BITR_TOKEN: (process.env.NEXT_PUBLIC_BITR_TOKEN_ADDRESS || '0xbB966Dd2696005c9e893304819237Ea4006A9380') as `0x${string}`,
  FAUCET: (process.env.NEXT_PUBLIC_BITR_FAUCET_ADDRESS || '0x9320ddf7CA7A2826DA3d557BD6A6661Ec7df13c0') as `0x${string}`,
  GUIDED_ORACLE: (process.env.NEXT_PUBLIC_GUIDED_ORACLE_ADDRESS || '0x9CFB1097577480BD0eDe1795018c89786c541097') as `0x${string}`,
  BITR_POOL: (process.env.NEXT_PUBLIC_BITR_POOL_ADDRESS || '0x080dB155ded47b08D9807ad38Be550784D4Df1e6') as `0x${string}`,
  OPTIMISTIC_ORACLE: (process.env.NEXT_PUBLIC_OPTIMISTIC_ORACLE_ADDRESS || '0x36fddb1844B89D4c0A00497A1C6B56B958bCcFB6') as `0x${string}`,
  STAKING: (process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || '0xD7A8f141320b4C060F8067741C812773166928E4') as `0x${string}`,
  REPUTATION_SYSTEM: (process.env.NEXT_PUBLIC_REPUTATION_SYSTEM_ADDRESS || '0x86F7B172caFC2BaB08E6c93BD984fab0b08630e2') as `0x${string}`,
  ODDYSSEY: (process.env.NEXT_PUBLIC_ODDYSSEY_ADDRESS || '0x6E51d91Adb14395B43Ad5b2A1A4f3F6C99332A5A') as `0x${string}`,
}

// Network configuration for contract calls
export const NETWORK_CONFIG = {
  chainId: 10143,
  rpcUrl: 'https://testnet-rpc.monad.xyz/',
  explorerUrl: 'https://testnet-explorer.monad.xyz',
}

// Global gas settings - Optimized for Monad Network (FIXED: Reasonable gas limits)
export const GAS_SETTINGS = {
  gas: BigInt(2000000), // 2M gas limit (sufficient for most transactions, user can increase if needed)
  gasPrice: BigInt(50000000000), // 50 gwei (base fee for Monad)
}
