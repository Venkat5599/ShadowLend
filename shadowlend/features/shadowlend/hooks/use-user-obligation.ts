/**
 * User Obligation Hook
 * Fetches and manages user's lending position data
 */

import { useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from './use-connection'
import { usePoolAddresses } from './use-pool'
import { findUserObligationPda, SOL_PRICE_CENTS, USDC_PRICE_CENTS, type UserPositionData } from '../program'
import { useWallet } from '@/features/account/use-wallet'

/**
 * Parse raw user obligation account data
 */
function parseUserObligationAccount(data: Buffer) {
  // Skip discriminator (8 bytes)
  let offset = 8

  // user (32 bytes)
  const user = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  // pool (32 bytes)
  const pool = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  // Skip encrypted_state_blob (variable length vec)
  const encryptedStateLen = data.readUInt32LE(offset)
  offset += 4 + encryptedStateLen

  // Skip state_commitment (32 bytes)
  offset += 32

  // total_funded (u64 - 8 bytes) - cumulative deposits
  const totalFunded = data.readBigUInt64LE(offset)
  offset += 8

  // total_claimed (u64 - 8 bytes) - cumulative withdrawals
  const totalClaimed = data.readBigUInt64LE(offset)
  offset += 8

  // has_pending_withdrawal (bool - 1 byte)
  const hasPendingWithdrawal = data.readUInt8(offset) === 1
  offset += 1

  // withdrawal_request_ts (i64 - 8 bytes)
  const withdrawalRequestTs = data.readBigInt64LE(offset)
  offset += 8

  // state_nonce (u128 - 16 bytes)
  const stateNonce = data.readBigUInt64LE(offset) // Read lower 64 bits
  offset += 16

  // last_update_ts (i64 - 8 bytes)
  const lastUpdateTs = data.readBigInt64LE(offset)

  return {
    user,
    pool,
    totalFunded,
    totalClaimed,
    hasPendingWithdrawal,
    withdrawalRequestTs,
    stateNonce,
    lastUpdateTs,
  }
}

/**
 * Calculate user position from on-chain data
 * Note: Since actual balances are encrypted, we estimate from public funding data
 */
function calculateUserPosition(
  totalFunded: bigint,
  totalClaimed: bigint,
  ltv: number = 80
): UserPositionData {
  // Estimate deposited amount (funded - claimed) in lamports
  const depositedLamports = totalFunded - totalClaimed
  const depositedSol = Number(depositedLamports) / 1e9

  // Calculate USD value using mock price
  const depositedValueUsd = (depositedSol * SOL_PRICE_CENTS) / 100

  // Calculate max borrow based on LTV
  const maxBorrowUsd = (depositedValueUsd * ltv) / 100

  // For now, we don't have actual borrow data (it's encrypted)
  // In a real implementation, the user would decrypt their state
  const borrowedAmount = 0
  const borrowedValueUsd = 0

  // Calculate available to borrow
  const availableToBorrowUsd = maxBorrowUsd - borrowedValueUsd

  // Calculate health factor (infinity if no borrows)
  const healthFactor = borrowedValueUsd > 0 ? (depositedValueUsd * 0.85) / borrowedValueUsd : 999

  return {
    depositedAmount: depositedSol,
    depositedValueUsd,
    borrowedAmount,
    borrowedValueUsd,
    healthFactor,
    maxBorrowUsd,
    availableToBorrowUsd,
  }
}

/**
 * Hook to fetch user's obligation/position data
 */
export function useUserObligation(network: 'devnet' | 'localnet' = 'devnet') {
  const { connection } = useConnection()
  const { account } = useWallet()
  const addresses = usePoolAddresses(network)

  const userPublicKey = account?.publicKey

  return useQuery({
    queryKey: ['userObligation', userPublicKey?.toString(), addresses.poolPda.toString(), network],
    queryFn: async (): Promise<UserPositionData | null> => {
      if (!userPublicKey) return null

      try {
        // Derive user obligation PDA
        const [obligationPda] = findUserObligationPda(userPublicKey, addresses.poolPda)

        const accountInfo = await connection.getAccountInfo(obligationPda)
        if (!accountInfo) {
          // User has no position yet
          return {
            depositedAmount: 0,
            depositedValueUsd: 0,
            borrowedAmount: 0,
            borrowedValueUsd: 0,
            healthFactor: 999,
            maxBorrowUsd: 0,
            availableToBorrowUsd: 0,
          }
        }

        const obligationData = parseUserObligationAccount(accountInfo.data)
        return calculateUserPosition(obligationData.totalFunded, obligationData.totalClaimed)
      } catch (error) {
        console.error('Failed to fetch user obligation:', error)
        return null
      }
    },
    enabled: !!userPublicKey,
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds
  })
}

/**
 * Hook to get user's obligation PDA address
 */
export function useUserObligationAddress(network: 'devnet' | 'localnet' = 'devnet') {
  const { account } = useWallet()
  const addresses = usePoolAddresses(network)

  if (!account?.publicKey) return null

  const [obligationPda] = findUserObligationPda(account.publicKey, addresses.poolPda)
  return obligationPda
}
