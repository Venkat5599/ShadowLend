/**
 * Pool Data Hook
 * Fetches and parses pool account data from the blockchain
 */

import { useQuery } from '@tanstack/react-query'
import { PublicKey, AccountInfo } from '@solana/web3.js'
import { useConnection } from './use-connection'
import { getDeploymentAddresses, type Pool, type PoolDisplayData } from '../program'

/**
 * Parse raw pool account data
 * Note: This is a simplified parser. In production, use Anchor's account decoder.
 */
function parsePoolAccount(data: Buffer): Partial<Pool> {
  // Skip discriminator (8 bytes)
  let offset = 8

  // authority (32 bytes)
  const authority = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  // collateralMint (32 bytes)
  const collateralMint = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  // borrowMint (32 bytes)
  const borrowMint = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  // Skip encrypted_pool_state (variable length vec - 4 bytes length + data)
  const encryptedStateLen = data.readUInt32LE(offset)
  offset += 4 + encryptedStateLen

  // Skip pool_state_commitment (32 bytes)
  offset += 32

  // ltv (u16 - 2 bytes)
  const ltv = data.readUInt16LE(offset)
  offset += 2

  // liquidation_threshold (u16 - 2 bytes)
  const liquidationThreshold = data.readUInt16LE(offset)
  offset += 2

  // liquidation_bonus (u16 - 2 bytes)
  const liquidationBonus = data.readUInt16LE(offset)
  offset += 2

  // fixed_borrow_rate (u64 - 8 bytes)
  const fixedBorrowRate = data.readBigUInt64LE(offset)

  return {
    authority,
    collateralMint,
    borrowMint,
    ltv,
    liquidationThreshold,
    liquidationBonus,
    fixedBorrowRate,
  }
}

/**
 * Convert pool data to display format
 */
function toDisplayData(pool: Partial<Pool>, address: PublicKey): PoolDisplayData {
  return {
    address,
    collateralMint: pool.collateralMint!,
    borrowMint: pool.borrowMint!,
    ltv: (pool.ltv || 0) / 100, // Convert basis points to percentage
    liquidationThreshold: (pool.liquidationThreshold || 0) / 100,
    liquidationBonus: (pool.liquidationBonus || 0) / 100,
    borrowRate: Number(pool.fixedBorrowRate || 0n) / 100, // Convert basis points to percentage
  }
}

/**
 * Hook to fetch pool data
 */
export function usePool(network: 'devnet' | 'localnet' = 'devnet') {
  const { connection } = useConnection()
  const addresses = getDeploymentAddresses(network)

  return useQuery({
    queryKey: ['pool', addresses.poolPda.toString(), network],
    queryFn: async (): Promise<PoolDisplayData | null> => {
      try {
        const accountInfo = await connection.getAccountInfo(addresses.poolPda)
        if (!accountInfo) {
          console.log('Pool account not found')
          return null
        }

        const poolData = parsePoolAccount(accountInfo.data)
        return toDisplayData(poolData, addresses.poolPda)
      } catch (error) {
        console.error('Failed to fetch pool:', error)
        return null
      }
    },
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  })
}

/**
 * Hook to get pool addresses without fetching data
 */
export function usePoolAddresses(network: 'devnet' | 'localnet' = 'devnet') {
  return getDeploymentAddresses(network)
}
