/**
 * ShadowLend Program Types
 * Type definitions matching the on-chain Anchor program
 */

import { PublicKey } from '@solana/web3.js'

// Program ID from deployment
// Updated: 2026-01-30 - Program ID from friend, cluster offset 456
export const PROGRAM_ID = new PublicKey('FpHChpheLnvPS9Qd7DyXwSrvSc3KCELkx4BC5MTE8T7k')

// Arcium Program ID
// Updated: 2026-01-30 - Arcium deployment
export const ARCIUM_PROGRAM_ID = new PublicKey('Arcj82pX7HxYKLR92qvgZUAd7vGS1k4hQvAFcPATFdEQ')

// PDA Seeds
export const POOL_SEED = 'pool'
export const VAULT_SEED = 'vault'
export const OBLIGATION_SEED = 'obligation'
export const COLLATERAL_SUFFIX = 'collateral'
export const BORROW_SUFFIX = 'borrow'

// Mock prices (matching program constants)
export const SOL_PRICE_CENTS = 15000 // $150.00
export const USDC_PRICE_CENTS = 100 // $1.00

/**
 * Pool account structure (on-chain)
 */
export interface Pool {
  authority: PublicKey
  collateralMint: PublicKey
  borrowMint: PublicKey
  encryptedPoolState: Uint8Array
  poolStateCommitment: Uint8Array
  ltv: number // basis points (80% = 8000)
  liquidationThreshold: number // basis points (85% = 8500)
  liquidationBonus: number // basis points (5% = 500)
  fixedBorrowRate: bigint // basis points per year
  vaultNonce: bigint
  lastUpdateTs: bigint
  bump: number
}

/**
 * User obligation account structure (on-chain)
 */
export interface UserObligation {
  user: PublicKey
  pool: PublicKey
  encryptedStateBlob: Uint8Array
  stateCommitment: Uint8Array
  totalFunded: bigint // cumulative deposits (public)
  totalClaimed: bigint // cumulative withdrawals (public)
  hasPendingWithdrawal: boolean
  withdrawalRequestTs: bigint
  stateNonce: bigint
  lastUpdateTs: bigint
  bump: number
}

/**
 * Deployment configuration
 */
export interface DeploymentConfig {
  programId: string
  poolPda: string
  collateralMint: string
  borrowMint: string
  collateralVault: string
  borrowVault: string
  admin: string
  deployedAt: string
  network: string
}

/**
 * Pool display data (for UI)
 */
export interface PoolDisplayData {
  address: PublicKey
  collateralMint: PublicKey
  borrowMint: PublicKey
  ltv: number // percentage (0-100)
  liquidationThreshold: number // percentage (0-100)
  liquidationBonus: number // percentage (0-100)
  borrowRate: number // percentage APY
}

/**
 * User position display data (for UI)
 */
export interface UserPositionData {
  depositedAmount: number // in SOL
  depositedValueUsd: number
  borrowedAmount: number // in USDC
  borrowedValueUsd: number
  healthFactor: number // 1.0 = at liquidation threshold
  maxBorrowUsd: number
  availableToBorrowUsd: number
}
