/**
 * Arcium MXE Integration
 * Handles Arcium-specific account derivation and constants
 */

import { PublicKey } from '@solana/web3.js'

// Arcium Program ID (from Arcium SDK / Anchor.toml)
// Updated: 2026-01-30 - Arcium deployment
export const ARCIUM_PROGRAM_ID = new PublicKey('Arcj82pX7HxYKLR92qvgZUAd7vGS1k4hQvAFcPATFdEQ')

// Helper to convert string to Uint8Array
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// Helper to write u64 little-endian to Uint8Array
function writeU64LE(value: bigint): Uint8Array {
  const buffer = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    buffer[i] = Number((value >> BigInt(i * 8)) & 0xffn)
  }
  return buffer
}

// Helper to write u32 little-endian to Uint8Array
function writeU32LE(value: number): Uint8Array {
  const buffer = new Uint8Array(4)
  buffer[0] = value & 0xff
  buffer[1] = (value >> 8) & 0xff
  buffer[2] = (value >> 16) & 0xff
  buffer[3] = (value >> 24) & 0xff
  return buffer
}

// Arcium MXE Account Seeds
export const MXE_SEED = stringToBytes('MXEAccount')
export const MEMPOOL_SEED = stringToBytes('Mempool')
export const EXECPOOL_SEED = stringToBytes('Execpool')
export const COMPUTATION_SEED = stringToBytes('ComputationAccount')
export const COMP_DEF_SEED = stringToBytes('ComputationDefinitionAccount')
export const CLUSTER_SEED = stringToBytes('Cluster')
export const FEE_POOL_SEED = stringToBytes('FeePool')
export const CLOCK_SEED = stringToBytes('ClockAccount')
export const SIGN_PDA_SEED = stringToBytes('SignerAccount')

/**
 * Compute the computation definition offset from function name
 * This matches the Arcium comp_def_offset! macro
 */
export function computeCompDefOffset(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Computation Definition Offsets (matching lib.rs)
export const COMP_DEF_OFFSET_DEPOSIT = computeCompDefOffset('compute_confidential_deposit')
export const COMP_DEF_OFFSET_BORROW = computeCompDefOffset('compute_confidential_borrow')
export const COMP_DEF_OFFSET_WITHDRAW = computeCompDefOffset('compute_confidential_withdraw')
export const COMP_DEF_OFFSET_REPAY = computeCompDefOffset('compute_confidential_repay')
export const COMP_DEF_OFFSET_LIQUIDATE = computeCompDefOffset('compute_confidential_liquidate')
export const COMP_DEF_OFFSET_INTEREST = computeCompDefOffset('compute_confidential_interest')

/**
 * Derive MXE PDA
 */
export function deriveMxePda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([MXE_SEED, programId.toBytes()], ARCIUM_PROGRAM_ID)
}

/**
 * Derive Sign PDA for the program
 */
export function deriveSignPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SIGN_PDA_SEED], programId)
}

/**
 * Derive Mempool PDA
 */
export function deriveMempoolPda(mxeAccount: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([MEMPOOL_SEED, mxeAccount.toBytes()], ARCIUM_PROGRAM_ID)
}

/**
 * Derive Execpool PDA
 */
export function deriveExecpoolPda(mxeAccount: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([EXECPOOL_SEED, mxeAccount.toBytes()], ARCIUM_PROGRAM_ID)
}

/**
 * Derive Computation PDA
 */
export function deriveComputationPda(
  computationOffset: bigint,
  mxeAccount: PublicKey
): [PublicKey, number] {
  const offsetBytes = writeU64LE(computationOffset)
  return PublicKey.findProgramAddressSync(
    [COMPUTATION_SEED, offsetBytes, mxeAccount.toBytes()],
    ARCIUM_PROGRAM_ID
  )
}

/**
 * Derive Computation Definition PDA
 */
export function deriveCompDefPda(compDefOffset: number, programId: PublicKey): [PublicKey, number] {
  const offsetBytes = writeU32LE(compDefOffset)
  return PublicKey.findProgramAddressSync(
    [COMP_DEF_SEED, programId.toBytes(), offsetBytes],
    ARCIUM_PROGRAM_ID
  )
}

/**
 * Derive Cluster PDA
 */
export function deriveClusterPda(clusterOffset: number): [PublicKey, number] {
  const offsetBytes = writeU64LE(BigInt(clusterOffset))
  return PublicKey.findProgramAddressSync([CLUSTER_SEED, offsetBytes], ARCIUM_PROGRAM_ID)
}

/**
 * Derive Fee Pool PDA
 */
export function deriveFeePoolPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([FEE_POOL_SEED], ARCIUM_PROGRAM_ID)
}

/**
 * Derive Clock PDA
 */
export function deriveClockPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([CLOCK_SEED], ARCIUM_PROGRAM_ID)
}

// Cluster offset for devnet (set during arcium deploy --cluster-offset 456)
const DEFAULT_CLUSTER_OFFSET = 456

// Hardcoded Arcium devnet addresses (from IDL)
const ARCIUM_FEE_POOL_ADDRESS = new PublicKey('BSC6rWJ9ucqZ6rcM3knfpgdRwCyJ7Q9KsddjeSL4EdHq')
const ARCIUM_CLOCK_ADDRESS = new PublicKey('EQr6UCd7eyRjpuRsNK6a8WxkgrpSGctKMFuz92FRRh63')

/**
 * Get all Arcium accounts needed for a computation
 */
export function getArciumAccounts(
  programId: PublicKey,
  computationOffset: bigint,
  compDefOffset: number
) {
  const [mxeAccount] = deriveMxePda(programId)
  const [signPda] = deriveSignPda(programId)
  const [mempoolAccount] = deriveMempoolPda(mxeAccount)
  const [execpoolAccount] = deriveExecpoolPda(mxeAccount)
  const [computationAccount] = deriveComputationPda(computationOffset, mxeAccount)
  const [compDefAccount] = deriveCompDefPda(compDefOffset, programId)
  const [clusterAccount] = deriveClusterPda(DEFAULT_CLUSTER_OFFSET)

  return {
    mxeAccount,
    signPda,
    mempoolAccount,
    execpoolAccount,
    computationAccount,
    compDefAccount,
    clusterAccount,
    feePoolAccount: ARCIUM_FEE_POOL_ADDRESS,
    clockAccount: ARCIUM_CLOCK_ADDRESS,
    arciumProgram: ARCIUM_PROGRAM_ID,
  }
}
