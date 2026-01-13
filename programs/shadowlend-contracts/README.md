# ShadowLend Smart Contracts

Privacy-preserving lending protocol built on Solana with Arcium MXE integration.

## Overview

ShadowLend enables users to deposit collateral, borrow assets, and participate in liquidations while keeping individual positions private through encrypted state management via Arcium's Multi-Party eXecution Environment (MXE).

## Architecture

- **Pool Management**: Public lending pools with aggregated metrics
- **Encrypted State**: User positions stored as encrypted blobs, decryptable only by MXE
- **Attestation Verification**: Cryptographic proofs ensure computation correctness
- **Interest Rate Model**: Dynamic rates based on utilization

## Key Features

- Privacy-preserving lending operations
- Automated liquidations with health factor monitoring
- Dynamic interest rates based on pool utilization
- Multi-asset collateral support
- Secure attestation verification

## Program Instructions

- `initialize_pool`: Create new lending pools
- `initialize_arcium_config`: Set up MXE node registry
- `deposit`: Deposit collateral into pools
- `borrow`: Borrow against collateral
- `repay`: Repay borrowed amounts
- `withdraw`: Withdraw deposited collateral
- `liquidate`: Liquidate undercollateralized positions
- `update_obligation`: Update encrypted user state from MXE

## Development

This is an Anchor-based Solana program. See the root directory for build and test instructions.

## Security

All encrypted state changes must be accompanied by valid MXE attestations. The program verifies:
- Attestation signatures using Ed25519
- Enclave measurements (MRENCLAVE)
- Timestamp freshness
- State commitment integrity

## License

MIT