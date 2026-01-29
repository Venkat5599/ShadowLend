/**
 * Borrow Hook
 * Handles borrowing tokens against deposited collateral
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js'
import { useConnection } from './use-connection'
import { usePoolAddresses } from './use-pool'
import { useWallet } from '@/features/account/use-wallet'
import { findUserObligationPda, PROGRAM_ID, getArciumAccounts, COMP_DEF_OFFSET_BORROW, ARCIUM_PROGRAM_ID } from '../program'
import { Platform } from 'react-native'

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  return address
}

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

const BORROW_DISCRIMINATOR = [228, 253, 131, 202, 207, 116, 89, 18]

function writeU64LE(arr: Uint8Array, value: bigint, offset: number): void {
  for (let i = 0; i < 8; i++) {
    arr[offset + i] = Number((value >> BigInt(i * 8)) & 0xffn)
  }
}

function buildBorrowInstruction(params: {
  payer: PublicKey
  pool: PublicKey
  userObligation: PublicKey
  computationOffset: bigint
  encryptedAmount: Uint8Array
  pubKey: Uint8Array
  nonce: bigint
}): TransactionInstruction {
  const { payer, pool, userObligation, computationOffset, encryptedAmount, pubKey, nonce } = params

  const arciumAccounts = getArciumAccounts(PROGRAM_ID, computationOffset, COMP_DEF_OFFSET_BORROW)

  const data = new Uint8Array(8 + 8 + 32 + 32 + 16)
  data.set(BORROW_DISCRIMINATOR, 0)
  writeU64LE(data, computationOffset, 8)
  data.set(encryptedAmount.slice(0, 32), 16)
  data.set(pubKey.slice(0, 32), 48)
  writeU64LE(data, nonce & BigInt('0xFFFFFFFFFFFFFFFF'), 80)
  writeU64LE(data, nonce >> 64n, 88)

  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: pool, isSigner: false, isWritable: false },
    { pubkey: userObligation, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.signPda, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.mxeAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.mempoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.execpoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.computationAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.compDefAccount, isSigner: false, isWritable: false },
    { pubkey: arciumAccounts.clusterAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.feePoolAccount, isSigner: false, isWritable: true },
    { pubkey: arciumAccounts.clockAccount, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: ARCIUM_PROGRAM_ID, isSigner: false, isWritable: false },
  ]

  return new TransactionInstruction({
    keys,
    programId: PROGRAM_ID,
    data: data as any,
  })
}

interface BorrowParams {
  amount: number
}

interface BorrowResult {
  signature: string
  amount: number
}

export function useBorrow(network: 'devnet' | 'localnet' = 'devnet') {
  const { connection } = useConnection()
  const { account } = useWallet()
  const addresses = usePoolAddresses(network)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ amount }: BorrowParams): Promise<BorrowResult> => {
      if (!account?.publicKey) {
        throw new Error('Wallet not connected')
      }

      const userPublicKey = account.publicKey
      const amountMicroUsdc = BigInt(Math.floor(amount * 1e6))

      const [userObligationPda] = findUserObligationPda(userPublicKey, addresses.poolPda)
      const userBorrowAta = getAssociatedTokenAddress(addresses.borrowMint, userPublicKey)

      const computationOffset = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
      const nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))

      const encryptedAmount = new Uint8Array(32)
      const amountView = new DataView(encryptedAmount.buffer)
      amountView.setBigUint64(0, amountMicroUsdc, true)

      const pubKey = new Uint8Array(32)

      const transaction = new Transaction()

      const ataInfo = await connection.getAccountInfo(userBorrowAta)
      if (!ataInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPublicKey,
            userBorrowAta,
            userPublicKey,
            addresses.borrowMint
          )
        )
      }

      transaction.add(
        buildBorrowInstruction({
          payer: userPublicKey,
          pool: addresses.poolPda,
          userObligation: userObligationPda,
          computationOffset,
          encryptedAmount,
          pubKey,
          nonce,
        })
      )

      transaction.feePayer = userPublicKey

      let signature: string

      if (Platform.OS === 'web') {
        const phantom = (window as any).phantom?.solana || (window as any).solana
        if (!phantom) throw new Error('Phantom wallet not found')

        // Get fresh blockhash right before signing
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
        transaction.recentBlockhash = blockhash

        const signedTx = await phantom.signTransaction(transaction)
        signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })

        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
      } else {
        throw new Error('Mobile transaction signing not implemented yet')
      }

      return { signature, amount }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userObligation'] })
      queryClient.invalidateQueries({ queryKey: ['borrowBalance'] })
    },
  })
}
