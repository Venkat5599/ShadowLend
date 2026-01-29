/**
 * Withdraw Hook
 * Handles withdrawing collateral from the ShadowLend pool
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useConnection } from './use-connection'
import { usePoolAddresses } from './use-pool'
import { useWallet } from '@/features/account/use-wallet'
import { findUserObligationPda, PROGRAM_ID, getArciumAccounts, COMP_DEF_OFFSET_WITHDRAW, ARCIUM_PROGRAM_ID } from '../program'
import { Platform } from 'react-native'

const WITHDRAW_DISCRIMINATOR = [183, 18, 70, 156, 148, 109, 161, 34]

function writeU64LE(arr: Uint8Array, value: bigint, offset: number): void {
  for (let i = 0; i < 8; i++) {
    arr[offset + i] = Number((value >> BigInt(i * 8)) & 0xffn)
  }
}

function buildWithdrawInstruction(params: {
  payer: PublicKey
  pool: PublicKey
  userObligation: PublicKey
  computationOffset: bigint
  encryptedAmount: Uint8Array
  pubKey: Uint8Array
  nonce: bigint
}): TransactionInstruction {
  const { payer, pool, userObligation, computationOffset, encryptedAmount, pubKey, nonce } = params

  const arciumAccounts = getArciumAccounts(PROGRAM_ID, computationOffset, COMP_DEF_OFFSET_WITHDRAW)

  const data = new Uint8Array(8 + 8 + 32 + 32 + 16)
  data.set(WITHDRAW_DISCRIMINATOR, 0)
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

interface WithdrawParams {
  amount: number
}

interface WithdrawResult {
  signature: string
  amount: number
}

export function useWithdraw(network: 'devnet' | 'localnet' = 'devnet') {
  const { connection } = useConnection()
  const { account } = useWallet()
  const addresses = usePoolAddresses(network)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ amount }: WithdrawParams): Promise<WithdrawResult> => {
      if (!account?.publicKey) {
        throw new Error('Wallet not connected')
      }

      const userPublicKey = account.publicKey
      const amountLamports = BigInt(Math.floor(amount * LAMPORTS_PER_SOL))

      const [userObligationPda] = findUserObligationPda(userPublicKey, addresses.poolPda)

      const computationOffset = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
      const nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))

      const encryptedAmount = new Uint8Array(32)
      const amountView = new DataView(encryptedAmount.buffer)
      amountView.setBigUint64(0, amountLamports, true)

      const pubKey = new Uint8Array(32)

      const transaction = new Transaction()

      transaction.add(
        buildWithdrawInstruction({
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
      queryClient.invalidateQueries({ queryKey: ['solBalance'] })
      queryClient.invalidateQueries({ queryKey: ['collateralBalance'] })
    },
  })
}
