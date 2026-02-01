/**
 * Deposit Hook
 * Handles depositing collateral into the ShadowLend pool
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

import { useConnection } from './use-connection'
import { usePoolAddresses } from './use-pool'
import { useWallet } from '@/features/account/use-wallet'
import { findUserObligationPda, PROGRAM_ID, getArciumAccounts, COMP_DEF_OFFSET_DEPOSIT, ARCIUM_PROGRAM_ID } from '../program'
import { Platform } from 'react-native'

// SPL Token Program IDs
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

/**
 * Get Associated Token Address
 */
function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  return address
}

/**
 * Create instruction to create ATA if it doesn't exist
 */
function createAssociatedTokenAccountInstruction(
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

// Anchor instruction discriminator for "deposit"
const DEPOSIT_DISCRIMINATOR = [242, 35, 198, 137, 82, 225, 242, 182]

/**
 * Helper to write u64 to Uint8Array at offset (little-endian)
 */
function writeU64LE(arr: Uint8Array, value: bigint, offset: number): void {
  for (let i = 0; i < 8; i++) {
    arr[offset + i] = Number((value >> BigInt(i * 8)) & 0xffn)
  }
}

/**
 * Helper to write u128 to Uint8Array at offset (little-endian)
 */
function writeU128LE(arr: Uint8Array, value: bigint, offset: number): void {
  for (let i = 0; i < 16; i++) {
    arr[offset + i] = Number((value >> BigInt(i * 8)) & 0xffn)
  }
}

/**
 * Build deposit instruction
 */
function buildDepositInstruction(params: {
  payer: PublicKey
  pool: PublicKey
  userObligation: PublicKey
  collateralMint: PublicKey
  userTokenAccount: PublicKey
  collateralVault: PublicKey
  computationOffset: BN
  amount: bigint
  userPubkey: Uint8Array
  userNonce: bigint
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
    userPubkey,
    userNonce,
  } = params

  // Get Arcium accounts
  const arciumAccounts = getArciumAccounts(PROGRAM_ID, computationOffset, COMP_DEF_OFFSET_DEPOSIT)

  // Debug: Log the MXE account we're using
  console.log('MXE Account:', arciumAccounts.mxeAccount.toBase58())
  console.log('Program ID:', PROGRAM_ID.toBase58())

  // Encode instruction data: discriminator + computation_offset (u64) + amount (u64) + user_pubkey ([u8; 32]) + user_nonce (u128)
  const data = new Uint8Array(8 + 8 + 8 + 32 + 16)
  data.set(DEPOSIT_DISCRIMINATOR, 0)
  data.set(computationOffset.toArray('le', 8), 8)
  writeU64LE(data, amount, 16)
  data.set(userPubkey, 24) // 32 bytes for user_pubkey
  writeU128LE(data, userNonce, 56) // 16 bytes for user_nonce

  const keys = [
    // Arcium accounts (must come first per IDL)
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: arciumAccounts.signPda, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.mxeAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.mempoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.execpoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.computationAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.compDefAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.clusterAccount, isSigner: false, isWritable: true },
    { pubkey: new PublicKey('G2sRWJvi3xoyh5k2gY49eG9L8YhAEWQPtNb1zb1GXTtC'), isSigner: false, isWritable: true }, // pool_account (hardcoded in IDL)
    { pubkey: arciumAccounts.clockAccount, isSigner: false, isWritable: true },
    // User accounts
    { pubkey: pool, isSigner: false, isWritable: true },
    { pubkey: userObligation, isSigner: false, isWritable: true },
    { pubkey: collateralMint, isSigner: false, isWritable: false },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: collateralVault, isSigner: false, isWritable: true },
    // Programs
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: ARCIUM_PROGRAM_ID, isSigner: false, isWritable: false },
  ]

  return new TransactionInstruction({
    keys,
    programId: PROGRAM_ID,
    data: data as any,
  })
}

interface DepositParams {
  amount: number // Amount in SOL
}

interface DepositResult {
  signature: string
  amount: number
}

/**
 * Hook for depositing collateral
 */
export function useDeposit(network: 'devnet' | 'localnet' = 'devnet') {
  const { connection } = useConnection()
  const { account } = useWallet()
  const addresses = usePoolAddresses(network)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ amount }: DepositParams): Promise<DepositResult> => {
      if (!account?.publicKey) {
        throw new Error('Wallet not connected')
      }

      const userPublicKey = account.publicKey
      const amountLamports = BigInt(Math.floor(amount * LAMPORTS_PER_SOL))

      // Derive PDAs
      const [userObligationPda] = findUserObligationPda(userPublicKey, addresses.poolPda)
      const userCollateralAta = getAssociatedTokenAddress(addresses.collateralMint, userPublicKey)

      // Generate random computation offset for Arcium MXE
      const computationOffset = new BN(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))

      // Generate user encryption parameters
      // For now, use placeholder values - in production, these would be derived from user's keypair
      const userPubkey = new Uint8Array(32).fill(0) // Placeholder X25519 public key
      const userNonce = BigInt(Date.now()) // Use timestamp as nonce

      // Build transaction. Wrap in try/catch for error handling.
      try {
      const transaction = new Transaction()

      // Check if user's collateral ATA exists, create if not
      const ataInfo = await connection.getAccountInfo(userCollateralAta)
      if (!ataInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPublicKey,
            userCollateralAta,
            userPublicKey,
            addresses.collateralMint
          )
        )
      }

      // Add deposit instruction with all Arcium accounts
      transaction.add(
        buildDepositInstruction({
          payer: userPublicKey,
          pool: addresses.poolPda,
          userObligation: userObligationPda,
          collateralMint: addresses.collateralMint,
          userTokenAccount: userCollateralAta,
          collateralVault: addresses.collateralVault,
          computationOffset,
          amount: amountLamports,
          userPubkey,
          userNonce,
        })
      )

      // Set fee payer
      transaction.feePayer = userPublicKey

      console.log('Arcium Ephemeral Key (Placeholder):', new PublicKey(userPubkey).toBase58())
      // Sign and send transaction
      let signature: string

      if (Platform.OS === 'web') {
        // Web: Use Phantom extension
        const phantom = (window as any).phantom?.solana || (window as any).solana
        if (!phantom) throw new Error('Phantom wallet not found')

        // Get fresh blockhash right before signing
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
        transaction.recentBlockhash = blockhash

        const signedTx = await phantom.signTransaction(transaction)
        
        // Send with skipPreflight for faster submission
        signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })

        // Wait for confirmation
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
      } else {
        // Mobile: Use Mobile Wallet Adapter
        throw new Error('Mobile transaction signing not implemented yet')
      }

      return { signature, amount }
    } catch (error: any) {
      console.error('Deposit failed:', error)
      if (error.message?.includes('Attempt to debit an account but found no record of a prior credit')) {
        throw new Error('Insufficient SOL. Please airdrop funds to your wallet (Localnet).')
      }
      throw error
    }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['userObligation'] })
      queryClient.invalidateQueries({ queryKey: ['solBalance'] })
      queryClient.invalidateQueries({ queryKey: ['collateralBalance'] })
    },
  })
}
