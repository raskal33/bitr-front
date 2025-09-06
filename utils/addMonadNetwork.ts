export const MONAD_NETWORK = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz/'],
  blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
}

export async function addMonadNetwork() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Try to switch to the network first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_NETWORK.chainId }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK],
          })
        } catch (addError) {
          console.error('Failed to add Monad network:', addError)
          throw addError
        }
      } else {
        console.error('Failed to switch to Monad network:', switchError)
        throw switchError
      }
    }
  } else {
    throw new Error('MetaMask is not installed')
  }
}

export function getMonadNetworkConfig() {
  return MONAD_NETWORK
}

// Legacy function name for backward compatibility
export function getSomniaNetworkConfig() {
  return MONAD_NETWORK
}

// Legacy function name for backward compatibility  
export async function addSomniaNetwork() {
  return addMonadNetwork()
} 