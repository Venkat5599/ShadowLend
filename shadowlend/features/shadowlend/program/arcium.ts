import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import {
  getCompDefAccAddress,
  getClusterAccAddress,
  getComputationAccAddress,
  getExecutingPoolAccAddress,
  getMempoolAccAddress,
  getMXEAccAddress,
  getFeePoolAccAddress,
  getClockAccAddress,
  getArciumProgramId,
  Aes256Cipher, // Valid Element
} from '@arcium-hq/client'
import { AppConfig } from '@/constants/app-config'

// Arcium Program ID
export const ARCIUM_PROGRAM_ID = getArciumProgramId()

// Helper to convert Uint8Array (le u32) to number
function bytesToU32LE(bytes: Uint8Array | number[]): number {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return new DataView(u8.buffer, u8.byteOffset, u8.byteLength).getUint32(0, true)
}

// Computation Definition Offsets (Hardcoded to avoid runtime crypto crash in Expo)
// Verified via scripts/debug/print-offsets.ts
export const COMP_DEF_OFFSET_DEPOSIT = 2029763011
export const COMP_DEF_OFFSET_BORROW = 2982938321
export const COMP_DEF_OFFSET_WITHDRAW = 3676467138
export const COMP_DEF_OFFSET_REPAY = 983233638
export const COMP_DEF_OFFSET_LIQUIDATE = 1959581372
export const COMP_DEF_OFFSET_SPEND = 4281551606

/**
 * Encrypt input data for Arcium computation using AES-256-CTR
 * @param input - The plaintext data to encrypt
 * @param sharedSecret - The shared secret derived from ECDH (Client PrivKey * MXE PubKey)
 * @param nonce - 8-byte nonce for CTR mode
 */
export function encryptInput(input: Uint8Array, sharedSecret: Uint8Array, nonce: Uint8Array): Uint8Array {
    const cipher = new Aes256Cipher(sharedSecret);
    return cipher.encrypt(input, nonce);
}

/**
 * Decrypt output data from Arcium computation using AES-256-CTR
 * @param output - The ciphertext data to decrypt
 * @param sharedSecret - The shared secret derived from ECDH (Client PrivKey * MXE PubKey)
 * @param nonce - 8-byte nonce for CTR mode
 */
export function decryptOutput(output: Uint8Array, sharedSecret: Uint8Array, nonce: Uint8Array): Uint8Array {
    const cipher = new Aes256Cipher(sharedSecret);
    return cipher.decrypt(output, nonce);
}


/**
 * Derive MXE PDA
 */
export function deriveMxePda(programId: PublicKey): PublicKey {
  return getMXEAccAddress(programId)
}

/**
 * Derive Sign PDA for the program
 * Used for authorizing transfers from PDAs
 */
export function deriveSignPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('ArciumSignerAccount')], programId)[0]
}

/**
 * Derive Mempool PDA
 */
export function deriveMempoolPda(): PublicKey {
  return getMempoolAccAddress(AppConfig.arciumClusterOffset)
}

/**
 * Derive Execpool PDA
 */
export function deriveExecpoolPda(): PublicKey {
  return getExecutingPoolAccAddress(AppConfig.arciumClusterOffset)
}

/**
 * Derive Computation PDA
 */
export function deriveComputationPda(
  computationOffset: BN | bigint
): PublicKey {
  const offset = computationOffset instanceof BN ? computationOffset : new BN(computationOffset.toString())
  return getComputationAccAddress(AppConfig.arciumClusterOffset, offset)
}

/**
 * Derive Computation Definition PDA
 */
export function deriveCompDefPda(compDefOffset: number, programId: PublicKey): PublicKey {
  return getCompDefAccAddress(programId, compDefOffset)
}

/**
 * Derive Cluster PDA
 */
export function deriveClusterPda(clusterOffset: number): PublicKey {
  return getClusterAccAddress(clusterOffset)
}

/**
 * Derive Fee Pool PDA
 */
export function deriveFeePoolPda(): PublicKey {
  return getFeePoolAccAddress()
}

/**
 * Derive Clock PDA
 */
export function deriveClockPda(): PublicKey {
  return getClockAccAddress()
}

/**
 * Get all Arcium accounts needed for a computation
 */
export function getArciumAccounts(
  programId: PublicKey,
  computationOffset: BN | bigint,
  compDefOffset: number
) {
  const mxeAccount = deriveMxePda(programId)
  const signPda = deriveSignPda(programId)
  const mempoolAccount = deriveMempoolPda()
  const execpoolAccount = deriveExecpoolPda()
  const computationAccount = deriveComputationPda(computationOffset)
  const compDefAccount = deriveCompDefPda(compDefOffset, programId)
  const clusterAccount = deriveClusterPda(AppConfig.arciumClusterOffset)
  const feePoolAccount = deriveFeePoolPda()
  const clockAccount = deriveClockPda()

  return {
    mxeAccount,
    signPda,
    mempoolAccount,
    execpoolAccount,
    computationAccount,
    compDefAccount,
    clusterAccount,
    feePoolAccount,
    clockAccount,
    arciumProgram: ARCIUM_PROGRAM_ID,
  }
}
