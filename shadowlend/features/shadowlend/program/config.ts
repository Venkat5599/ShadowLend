/**
 * ShadowLend Deployment Configuration
 * Loads deployment info from AppConfig
 */

import { PublicKey } from '@solana/web3.js'
import type { DeploymentConfig } from './types'
import { AppConfig } from '@/constants/app-config'

const getDeployment = (): DeploymentConfig => ({
  programId: AppConfig.programId,
  poolPda: '2UDxdmiCuq1nYDvEYx1UTLGAPB3dZeX8bG51pw3ieQiY', // From deployment.json
  collateralMint: '2YUtZWmyZnAvQFbawWzD6JeNH8oJgE2MuDtdPv2KRzE7',
  borrowMint: 'Cuj8ft28zCGwhmjb1uh8e2nZcbsYaoytUDjUABAcxtrr',
  collateralVault: '6hMRTLUM3uPEZyUz3A4wLhvWGcXyCfzbBYpcYXcTzhCF', // From init-pool logs
  borrowVault: '8kQpnhoowLtec9pUQW6jDwnLSyNc9uQsiYSnLGCKewYb', // From init-pool logs
  admin: '9AVaR6JcQaX6CJwg5fNivx2qEAQ2nKAn86DRi7vL5kK2',
  deployedAt: new Date().toISOString(),
  network: 'localnet',
})

/**
 * Get deployment config for a specific network
 */
export function getDeploymentConfig(network: 'devnet' | 'localnet' | 'mainnet' = 'devnet'): DeploymentConfig {
    return getDeployment()
}

/**
 * Get parsed deployment addresses
 */
export function getDeploymentAddresses(network: 'devnet' | 'localnet' | 'mainnet' = 'devnet') {
  const config = getDeploymentConfig(network)
  return {
    programId: new PublicKey(config.programId),
    poolPda: new PublicKey(config.poolPda),
    collateralMint: new PublicKey(config.collateralMint),
    borrowMint: new PublicKey(config.borrowMint),
    collateralVault: new PublicKey(config.collateralVault),
    borrowVault: new PublicKey(config.borrowVault),
    admin: new PublicKey(config.admin),
  }
}
