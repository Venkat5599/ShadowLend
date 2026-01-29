/**
 * PDA Derivation Utilities
 * Functions to derive Program Derived Addresses for ShadowLend
 */

import { PublicKey } from '@solana/web3.js'
import { PROGRAM_ID } from './types'

// Helper to convert string to Uint8Array
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// PDA Seeds (matching backend)
const POOL_SEED = stringToBytes('pool')
const VAULT_SEED = stringToBytes('vault')
const OBLIGATION_SEED = stringToBytes('obligation')
const COLLATERAL_SUFFIX = stringToBytes('collateral')
const BORROW_SUFFIX = stringToBytes('borrow')

/**
 * Derives the Pool PDA address
 * Seeds: ["pool", collateral_mint, borrow_mint]
 */
export function findPoolPda(collateralMint: PublicKey, borrowMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [POOL_SEED, collateralMint.toBytes(), borrowMint.toBytes()],
    PROGRAM_ID
  )
}

/**
 * Derives the collateral vault PDA address
 * Seeds: ["vault", collateral_mint, borrow_mint, "collateral"]
 */
export function findCollateralVaultPda(
  collateralMint: PublicKey,
  borrowMint: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, collateralMint.toBytes(), borrowMint.toBytes(), COLLATERAL_SUFFIX],
    PROGRAM_ID
  )
}

/**
 * Derives the borrow vault PDA address
 * Seeds: ["vault", collateral_mint, borrow_mint, "borrow"]
 */
export function findBorrowVaultPda(
  collateralMint: PublicKey,
  borrowMint: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, collateralMint.toBytes(), borrowMint.toBytes(), BORROW_SUFFIX],
    PROGRAM_ID
  )
}

/**
 * Derives the UserObligation PDA address
 * Seeds: ["obligation", user, pool]
 */
export function findUserObligationPda(user: PublicKey, pool: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [OBLIGATION_SEED, user.toBytes(), pool.toBytes()],
    PROGRAM_ID
  )
}
