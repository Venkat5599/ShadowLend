/**
 * PDA Derivation Utilities
 * Functions to derive Program Derived Addresses for ShadowLend
 */

import { PublicKey } from '@solana/web3.js'
import { PROGRAM_ID } from './types'

// PDA Seeds (matching backend)
const POOL_SEED = Buffer.from('pool')
const VAULT_SEED = Buffer.from('vault')
const OBLIGATION_SEED = Buffer.from('obligation')
const COLLATERAL_SUFFIX = Buffer.from('collateral')
const BORROW_SUFFIX = Buffer.from('borrow')

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
