/**
 * ShadowLend Deployment Configuration
 * Loads deployment info for the current network
 */

import { PublicKey } from '@solana/web3.js'
import type { DeploymentConfig } from './types'

// Default deployment config (from deployment.json)
// Updated: 2026-01-30 - Program ID from friend, cluster offset 456
const DEFAULT_DEPLOYMENT: DeploymentConfig = {
  programId: 'FpHChpheLnvPS9Qd7DyXwSrvSc3KCELkx4BC5MTE8T7k',
  poolPda: 'AsYVZhy1twfeP1b6hALiYmSzLc1G2GRufKG4sL1o63us',
  collateralMint: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  borrowMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Test USDC
  collateralVault: '5fSQMEi2Ja5h2fQpvgBPCuLBzWmGRn4imtCuFdWaUra4',
  borrowVault: '8ZC4YDurkQoU6hBokknMRD9uY2T5LMYGrZ41Ku7eBBxp',
  admin: '9AVaR6JcQaX6CJwg5fNivx2qEAQ2nKAn86DRi7vL5kK2',
  deployedAt: '2026-01-30T00:00:00.000Z',
  network: 'devnet',
}

// Devnet deployment (same as default for now)
const DEVNET_DEPLOYMENT = DEFAULT_DEPLOYMENT

// Localnet deployment (for testing)
const LOCALNET_DEPLOYMENT: DeploymentConfig = {
  ...DEFAULT_DEPLOYMENT,
  network: 'localnet',
}

/**
 * Get deployment config for a specific network
 */
export function getDeploymentConfig(network: 'devnet' | 'localnet' | 'mainnet' = 'devnet'): DeploymentConfig {
  switch (network) {
    case 'devnet':
      return DEVNET_DEPLOYMENT
    case 'localnet':
      return LOCALNET_DEPLOYMENT
    case 'mainnet':
      throw new Error('Mainnet deployment not available yet')
    default:
      return DEFAULT_DEPLOYMENT
  }
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
