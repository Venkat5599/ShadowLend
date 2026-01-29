/**
 * Solana Connection Hook
 * Provides a connection instance based on the selected network
 */

import { useMemo } from 'react'
import { Connection } from '@solana/web3.js'
import { useNetwork } from '@/features/network/use-network'

/**
 * Hook to get a Solana connection for the selected network
 */
export function useConnection() {
  const { selectedNetwork } = useNetwork()

  const connection = useMemo(() => {
    return new Connection(selectedNetwork.url, {
      commitment: 'confirmed',
    })
  }, [selectedNetwork.url])

  return { connection, endpoint: selectedNetwork.url }
}
