/**
 * Token Balance Hooks
 * Fetches user's token balances for collateral and borrow tokens
 */

import { useQuery } from '@tanstack/react-query'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useConnection } from './use-connection'
import { usePoolAddresses } from './use-pool'
import { useWallet } from '@/features/account/use-wallet'
import { SOL_PRICE_CENTS, USDC_PRICE_CENTS } from '../program'

// SPL Token Program ID
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

/**
 * Get Associated Token Address
 */
function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  )
  return address
}

/**
 * Parse SPL token account data
 */
function parseTokenAccountData(data: Buffer): { mint: PublicKey; owner: PublicKey; amount: bigint } {
  return {
    mint: new PublicKey(data.subarray(0, 32)),
    owner: new PublicKey(data.subarray(32, 64)),
    amount: data.readBigUInt64LE(64),
  }
}

export interface TokenBalance {
  mint: PublicKey
  balance: number // in token units (not lamports)
  balanceUsd: number
  decimals: number
  symbol: string
}

/**
 * Hook to fetch user's SOL balance
 */
export function useSolBalance() {
  const { connection } = useConnection()
  const { account } = useWallet()

  return useQuery({
    queryKey: ['solBalance', account?.publicKey?.toString()],
    queryFn: async (): Promise<TokenBalance | null> => {
      if (!account?.publicKey) return null

      try {
        const balance = await connection.getBalance(account.publicKey)
        const solBalance = balance / LAMPORTS_PER_SOL
        const balanceUsd = (solBalance * SOL_PRICE_CENTS) / 100

        return {
          mint: new PublicKey('So11111111111111111111111111111111111111112'),
          balance: solBalance,
          balanceUsd,
          decimals: 9,
          symbol: 'SOL',
        }
      } catch (error) {
        console.error('Failed to fetch SOL balance:', error)
        return null
      }
    },
    enabled: !!account?.publicKey,
    staleTime: 10_000,
    refetchInterval: 15_000,
  })
}

/**
 * Hook to fetch user's collateral token balance (wrapped SOL or other)
 */
export function useCollateralBalance(network: 'devnet' | 'localnet' = 'devnet') {
  const { connection } = useConnection()
  const { account } = useWallet()
  const addresses = usePoolAddresses(network)

  return useQuery({
    queryKey: ['collateralBalance', account?.publicKey?.toString(), addresses.collateralMint.toString()],
    queryFn: async (): Promise<TokenBalance | null> => {
      if (!account?.publicKey) return null

      try {
        // For wrapped SOL, check if it's the native mint
        const isNativeSol = addresses.collateralMint.toString() === 'So11111111111111111111111111111111111111112'

        if (isNativeSol) {
          // Return native SOL balance
          const balance = await connection.getBalance(account.publicKey)
          const solBalance = balance / LAMPORTS_PER_SOL
          return {
            mint: addresses.collateralMint,
            balance: solBalance,
            balanceUsd: (solBalance * SOL_PRICE_CENTS) / 100,
            decimals: 9,
            symbol: 'SOL',
          }
        }

        // For other SPL tokens, get the ATA balance
        const ata = getAssociatedTokenAddress(addresses.collateralMint, account.publicKey)
        const accountInfo = await connection.getAccountInfo(ata)

        if (!accountInfo) {
          return {
            mint: addresses.collateralMint,
            balance: 0,
            balanceUsd: 0,
            decimals: 9,
            symbol: 'COL',
          }
        }

        const tokenData = parseTokenAccountData(accountInfo.data)
        const balance = Number(tokenData.amount) / 1e9
        return {
          mint: addresses.collateralMint,
          balance,
          balanceUsd: (balance * SOL_PRICE_CENTS) / 100,
          decimals: 9,
          symbol: 'COL',
        }
      } catch (error) {
        console.error('Failed to fetch collateral balance:', error)
        return null
      }
    },
    enabled: !!account?.publicKey,
    staleTime: 10_000,
    refetchInterval: 15_000,
  })
}

/**
 * Hook to fetch user's borrow token balance (USDC)
 */
export function useBorrowTokenBalance(network: 'devnet' | 'localnet' = 'devnet') {
  const { connection } = useConnection()
  const { account } = useWallet()
  const addresses = usePoolAddresses(network)

  return useQuery({
    queryKey: ['borrowBalance', account?.publicKey?.toString(), addresses.borrowMint.toString()],
    queryFn: async (): Promise<TokenBalance | null> => {
      if (!account?.publicKey) return null

      try {
        const ata = getAssociatedTokenAddress(addresses.borrowMint, account.publicKey)
        const accountInfo = await connection.getAccountInfo(ata)

        if (!accountInfo) {
          return {
            mint: addresses.borrowMint,
            balance: 0,
            balanceUsd: 0,
            decimals: 6,
            symbol: 'USDC',
          }
        }

        const tokenData = parseTokenAccountData(accountInfo.data)
        const balance = Number(tokenData.amount) / 1e6 // USDC has 6 decimals
        return {
          mint: addresses.borrowMint,
          balance,
          balanceUsd: (balance * USDC_PRICE_CENTS) / 100,
          decimals: 6,
          symbol: 'USDC',
        }
      } catch (error) {
        console.error('Failed to fetch borrow token balance:', error)
        return null
      }
    },
    enabled: !!account?.publicKey,
    staleTime: 10_000,
    refetchInterval: 15_000,
  })
}
