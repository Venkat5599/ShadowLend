/**
 * ShadowLend Instruction Builders
 * Creates transaction instructions that match the on-chain program
 */

import { PublicKey, TransactionInstruction, SystemProgram } from '@solana/web3.js'
import { PROGRAM_ID } from './types'
import { findUserObligationPda, findPoolPda } from './pda'
import {
  ARCIUM_PROGRAM_ID,
  getArciumAccounts,
  COMP_DEF_OFFSET_DEPOSIT,
  COMP_DEF_OFFSET_BORROW,
  COMP_DEF_OFFSET_WITHDRAW,
  COMP_DEF_OFFSET_REPAY,
} from './arcium'

// SPL Token Program IDs
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

/**
 * Get Associated Token Address
 */
export function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  return address
}

/**
 * Create instruction to create ATA if it doesn't exist
 */
export function createAssociatedTokenAccountInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: new Uint8Array(0) as any,
  })
}

// Anchor instruction discriminators (first 8 bytes of sha256("global:<instruction_name>"))
const DISCRIMINATORS = {
  deposit: [242, 35, 198, 137, 82, 225, 242, 182],
  borrow: [228, 253, 131, 202, 207, 116, 89, 18],
  withdraw: [183, 18, 70, 156, 148, 109, 161, 34],
  repay: [234, 103, 67, 82, 208, 234, 219, 166],
}

/**
 * Helper to write u64 to Uint8Array at offset (little-endian)
 */
function writeU64LE(arr: Uint8Array, value: bigint, offset: number): void {
  for (let i = 0; i < 8; i++) {
    arr[offset + i] = Number((value >> BigInt(i * 8)) & 0xffn)
  }
}

/**
 * Build deposit instruction with all required Arcium MXE accounts
 */
export function buildDepositInstruction(params: {
  payer: PublicKey
  pool: PublicKey
  userObligation: PublicKey
  collateralMint: PublicKey
  userTokenAccount: PublicKey
  collateralVault: PublicKey
  computationOffset: bigint
  amount: bigint
}): TransactionInstruction {
  const {
    payer,
    pool,
    userObligation,
    collateralMint,
    userTokenAccount,
    collateralVault,
    computationOffset,
    amount,
  } = params

  // Get Arcium accounts
  const arciumAccounts = getArciumAccounts(PROGRAM_ID, computationOffset, COMP_DEF_OFFSET_DEPOSIT)

  // Encode instruction data: discriminator + computation_offset (u64) + amount (u64)
  const data = new Uint8Array(8 + 8 + 8)
  data.set(DISCRIMINATORS.deposit, 0)
  writeU64LE(data, computationOffset, 8)
  writeU64LE(data, amount, 16)

  const keys = [
    // User accounts
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: pool, isSigner: false, isWritable: false },
    { pubkey: userObligation, isSigner: false, isWritable: true },
    { pubkey: collateralMint, isSigner: false, isWritable: false },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: collateralVault, isSigner: false, isWritable: true },
    // Arcium MXE accounts
    { pubkey: arciumAccounts.signPda, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.mxeAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.mempoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.execpoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.computationAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.compDefAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.clusterAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.feePoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.clockAccount, isSigner: false, isWritable: false },
    // Programs
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ARCIUM_PROGRAM_ID, isSigner: false, isWritable: false },
  ]

  return new TransactionInstruction({
    keys,
    programId: PROGRAM_ID,
    data: data as any,
  })
}

/**
 * Build borrow instruction with all required Arcium MXE accounts
 */
export function buildBorrowInstruction(params: {
  payer: PublicKey
  pool: PublicKey
  userObligation: PublicKey
  computationOffset: bigint
  encryptedAmount: Uint8Array
  pubKey: Uint8Array
  nonce: bigint
}): TransactionInstruction {
  const { payer, pool, userObligation, computationOffset, encryptedAmount, pubKey, nonce } = params

  // Get Arcium accounts
  const arciumAccounts = getArciumAccounts(PROGRAM_ID, computationOffset, COMP_DEF_OFFSET_BORROW)

  // Encode instruction data: discriminator + computation_offset (u64) + encrypted_amount (32) + pub_key (32) + nonce (u128)
  const data = new Uint8Array(8 + 8 + 32 + 32 + 16)
  data.set(DISCRIMINATORS.borrow, 0)
  writeU64LE(data, computationOffset, 8)
  data.set(encryptedAmount.slice(0, 32), 16)
  data.set(pubKey.slice(0, 32), 48)
  // Write u128 nonce as two u64s (little-endian)
  writeU64LE(data, nonce & BigInt('0xFFFFFFFFFFFFFFFF'), 80)
  writeU64LE(data, nonce >> 64n, 88)

  const keys = [
    // User accounts
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: pool, isSigner: false, isWritable: false },
    { pubkey: userObligation, isSigner: false, isWritable: true },
    // Arcium MXE accounts
    { pubkey: arciumAccounts.signPda, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.mxeAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.mempoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.execpoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.computationAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.compDefAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.clusterAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.feePoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.clockAccount, isSigner: false, isWritable: false },
    // Programs
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: ARCIUM_PROGRAM_ID, isSigner: false, isWritable: false },
  ]

  return new TransactionInstruction({
    keys,
    programId: PROGRAM_ID,
    data: data as any,
  })
}

/**
 * Build withdraw instruction with all required Arcium MXE accounts
 */
export function buildWithdrawInstruction(params: {
  payer: PublicKey
  pool: PublicKey
  userObligation: PublicKey
  computationOffset: bigint
  encryptedAmount: Uint8Array
  pubKey: Uint8Array
  nonce: bigint
}): TransactionInstruction {
  const { payer, pool, userObligation, computationOffset, encryptedAmount, pubKey, nonce } = params

  // Get Arcium accounts
  const arciumAccounts = getArciumAccounts(PROGRAM_ID, computationOffset, COMP_DEF_OFFSET_WITHDRAW)

  // Encode instruction data
  const data = new Uint8Array(8 + 8 + 32 + 32 + 16)
  data.set(DISCRIMINATORS.withdraw, 0)
  writeU64LE(data, computationOffset, 8)
  data.set(encryptedAmount.slice(0, 32), 16)
  data.set(pubKey.slice(0, 32), 48)
  writeU64LE(data, nonce & BigInt('0xFFFFFFFFFFFFFFFF'), 80)
  writeU64LE(data, nonce >> 64n, 88)

  const keys = [
    // User accounts
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: pool, isSigner: false, isWritable: false },
    { pubkey: userObligation, isSigner: false, isWritable: true },
    // Arcium MXE accounts
    { pubkey: arciumAccounts.signPda, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.mxeAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.mempoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.execpoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.computationAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.compDefAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.clusterAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.feePoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.clockAccount, isSigner: false, isWritable: false },
    // Programs
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: ARCIUM_PROGRAM_ID, isSigner: false, isWritable: false },
  ]

  return new TransactionInstruction({
    keys,
    programId: PROGRAM_ID,
    data: data as any,
  })
}

/**
 * Build repay instruction with all required Arcium MXE accounts
 */
export function buildRepayInstruction(params: {
  payer: PublicKey
  pool: PublicKey
  userObligation: PublicKey
  borrowMint: PublicKey
  userTokenAccount: PublicKey
  borrowVault: PublicKey
  computationOffset: bigint
  amount: bigint
}): TransactionInstruction {
  const {
    payer,
    pool,
    userObligation,
    borrowMint,
    userTokenAccount,
    borrowVault,
    computationOffset,
    amount,
  } = params

  // Get Arcium accounts
  const arciumAccounts = getArciumAccounts(PROGRAM_ID, computationOffset, COMP_DEF_OFFSET_REPAY)

  // Encode instruction data: discriminator + computation_offset (u64) + amount (u64)
  const data = new Uint8Array(8 + 8 + 8)
  data.set(DISCRIMINATORS.repay, 0)
  writeU64LE(data, computationOffset, 8)
  writeU64LE(data, amount, 16)

  const keys = [
    // User accounts
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: pool, isSigner: false, isWritable: false },
    { pubkey: userObligation, isSigner: false, isWritable: true },
    { pubkey: borrowMint, isSigner: false, isWritable: false },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: borrowVault, isSigner: false, isWritable: true },
    // Arcium MXE accounts
    { pubkey: arciumAccounts.signPda, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.mxeAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.mempoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.execpoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.computationAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.compDefAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.clusterAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.feePoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.clockAccount, isSigner: false, isWritable: false },
    // Programs
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ARCIUM_PROGRAM_ID, isSigner: false, isWritable: false },
  ]

  return new TransactionInstruction({
    keys,
    programId: PROGRAM_ID,
    data: data as any,
  })
}

// Re-export utilities
export { findUserObligationPda, findPoolPda }
