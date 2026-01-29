import { useWallet } from '@/features/account/use-wallet'
import { PublicKey } from '@solana/web3.js'

// Admin wallet addresses - only these wallets can access admin features
const ADMIN_WALLETS = [
  'HEgQysx71vNFKZdFvh2zwGMmih45gVgPw4qSZgRnvtNS', // Your admin wallet
  // Add more admin wallets as needed
]

export function useAdmin() {
  const { account } = useWallet()

  const isAdmin = () => {
    if (!account?.publicKey) return false
    
    const walletAddress = account.publicKey.toString()
    return ADMIN_WALLETS.includes(walletAddress)
  }

  return {
    isAdmin: isAdmin(),
    adminWallets: ADMIN_WALLETS,
  }
}
