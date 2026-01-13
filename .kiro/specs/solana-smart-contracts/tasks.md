# Implementation Plan: Solana Smart Contracts

## Overview

This implementation plan breaks down the ShadowLend Solana smart contracts into discrete coding tasks. The approach follows an incremental development strategy, building core data structures first, then implementing instructions, and finally adding advanced features like Arcium MXE integration and liquidation logic.

## Tasks

- [x] 1. Set up project structure and core dependencies
  - Initialize Anchor project with proper dependencies
  - Configure Cargo.toml with required crates (anchor-lang, anchor-spl, ed25519-dalek, etc.)
  - Set up basic program module structure
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Implement core data structures
  - [x] 2.1 Define Pool account structure
    - Implement Pool struct with all required fields
    - Add InterestRateModel struct
    - Include proper Anchor account attributes and constraints
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 11.1-11.5_

  - [x] 2.2 Define UserObligation account structure
    - Implement UserObligation struct with encrypted state fields
    - Add UserState struct for encrypted data format
    - Include CollateralAsset struct for multi-asset support
    - _Requirements: 3.1-3.4, 12.1-12.6_

  - [x] 2.3 Define ArciumConfig account structure
    - Implement ArciumConfig struct with MXE node registry
    - Add MxeNodeInfo and MxeAttestation structs
    - Include ComputationType enum for different operations
    - _Requirements: 9.1-9.6, 10.1-10.5_

  - [x] 2.4 Write unit tests for data structures
    - Test struct serialization/deserialization
    - Test account size calculations
    - Test PDA derivation logic
    - _Requirements: 1.1-1.4, 3.1-3.4, 10.1-10.5_

- [x] 3. Implement pool management instructions
  - [x] 3.1 Implement initialize_pool instruction
    - Create InitializePool accounts struct with proper constraints
    - Implement pool initialization logic with interest rate model
    - Add token vault creation and authority setup
    - _Requirements: 1.1-1.4_

  - [x] 3.2 Implement initialize_arcium_config instruction
    - Create InitializeArciumConfig accounts struct
    - Implement MXE node registry initialization
    - Add authority validation and configuration setup
    - _Requirements: 10.1-10.5_

  - [x] 3.3 Write unit tests for pool management
    - Test pool initialization with various parameters
    - Test Arcium config setup and validation
    - Test error conditions for invalid inputs
    - _Requirements: 1.1-1.4, 10.1-10.5_

- [ ] 4. Implement interest rate calculation utilities
  - [ ] 4.1 Create interest rate calculation functions
    - Implement update_interest_rates function with utilization-based model
    - Add linear rate calculation for below/above optimal utilization
    - Include deposit rate calculation with reserve factor
    - _Requirements: 11.1-11.5_

  - [ ] 4.2 Write property tests for interest rate model
    - **Property 1: Interest rates increase with utilization**
    - **Validates: Requirements 11.2, 11.3**

  - [ ] 4.3 Write unit tests for interest calculations
    - Test rate calculations at various utilization levels
    - Test edge cases (0% and 100% utilization)
    - Test reserve factor application
    - _Requirements: 11.1-11.5_

- [ ] 5. Implement attestation verification system
  - [ ] 5.1 Create MXE attestation verification functions
    - Implement verify_mxe_attestation function with signature verification
    - Add enclave measurement validation
    - Include timestamp freshness checks
    - _Requirements: 9.1-9.6_

  - [ ] 5.2 Create Arcium integration utilities
    - Implement forward_to_arcium_mxe function structure
    - Add MxeResult and MxeRequest data structures
    - Create placeholder for CPI integration
    - _Requirements: 4.3, 5.3, 6.2, 7.2, 8.2_

  - [ ] 5.3 Write property tests for attestation verification
    - **Property 2: Valid attestations always pass verification**
    - **Validates: Requirements 9.1-9.6**

  - [ ] 5.4 Write unit tests for attestation system
    - Test signature verification with valid/invalid signatures
    - Test enclave measurement validation
    - Test timestamp freshness validation
    - _Requirements: 9.1-9.6_

- [ ] 6. Checkpoint - Core infrastructure complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement deposit instruction
  - [ ] 7.1 Create Deposit accounts struct and instruction
    - Define account constraints for user, pool, and token accounts
    - Implement token transfer from user to pool vault
    - Add user obligation initialization logic
    - _Requirements: 4.1-4.6_

  - [ ] 7.2 Add MXE integration to deposit flow
    - Integrate forward_to_arcium_mxe call for encrypted state update
    - Add attestation verification before state updates
    - Update pool aggregates and interest rates
    - _Requirements: 4.3, 4.4, 4.6_

  - [ ] 7.3 Add deposit event emission
    - Implement DepositCompleted event structure
    - Add event emission after successful deposit
    - _Requirements: 14.1_

  - [ ] 7.4 Write property tests for deposit functionality
    - **Property 3: Deposits increase pool total_deposits**
    - **Validates: Requirements 4.5**

  - [ ] 7.5 Write unit tests for deposit instruction
    - Test successful deposit flow with valid inputs
    - Test error conditions (insufficient balance, invalid attestation)
    - Test user obligation creation and updates
    - _Requirements: 4.1-4.6, 13.2, 13.3_

- [ ] 8. Implement borrow instruction
  - [ ] 8.1 Create Borrow accounts struct and instruction
    - Define account constraints for existing user obligation
    - Implement liquidity checks and token transfer to user
    - Add pool state updates for total borrows
    - _Requirements: 5.1-5.6_

  - [ ] 8.2 Add health factor validation via MXE
    - Integrate MXE call for collateral and health factor validation
    - Add approval/rejection logic based on MXE response
    - Update user obligation with new encrypted state
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ] 8.3 Add borrow event emission
    - Implement BorrowCompleted event structure
    - Add event emission after successful borrow
    - _Requirements: 14.2_

  - [ ] 8.4 Write property tests for borrow functionality
    - **Property 4: Borrows increase pool total_borrows**
    - **Validates: Requirements 5.5**

  - [ ] 8.5 Write unit tests for borrow instruction
    - Test successful borrow with sufficient collateral
    - Test rejection for insufficient collateral
    - Test liquidity checks and error conditions
    - _Requirements: 5.1-5.6, 13.1, 13.6_

- [ ] 9. Implement repay instruction
  - [ ] 9.1 Create Repay accounts struct and instruction
    - Define account constraints for repayment flow
    - Implement token transfer from user to pool vault
    - Add pool state updates for total borrows reduction
    - _Requirements: 6.1-6.5_

  - [ ] 9.2 Add MXE integration for repay state updates
    - Forward repayment data to MXE for encrypted state update
    - Handle partial repayments and excess amount returns
    - Update user obligation with new encrypted state
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ] 9.3 Add repay event emission
    - Implement RepayCompleted event structure
    - Add event emission after successful repayment
    - _Requirements: 14.3_

  - [ ] 9.4 Write unit tests for repay instruction
    - Test full and partial repayments
    - Test excess amount handling
    - Test pool state updates
    - _Requirements: 6.1-6.5_

- [ ] 10. Implement withdraw instruction
  - [ ] 10.1 Create Withdraw accounts struct and instruction
    - Define account constraints for withdrawal flow
    - Implement health factor validation via MXE
    - Add token transfer from pool vault to user
    - _Requirements: 7.1-7.5_

  - [ ] 10.2 Add withdrawal validation and state updates
    - Integrate MXE health factor check before withdrawal
    - Update pool total deposits and user obligation
    - Handle rejection for insufficient collateral
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [ ] 10.3 Add withdraw event emission
    - Implement WithdrawCompleted event structure
    - Add event emission after successful withdrawal
    - _Requirements: 14.4_

  - [ ] 10.4 Write unit tests for withdraw instruction
    - Test successful withdrawals with sufficient collateral
    - Test rejection for insufficient collateral
    - Test pool state updates
    - _Requirements: 7.1-7.5, 13.1_

- [ ] 11. Checkpoint - Basic lending operations complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement liquidation instruction
  - [ ] 12.1 Create Liquidate accounts struct and instruction
    - Define account constraints for liquidator and target user
    - Implement health factor validation via MXE
    - Add liquidation parameter calculation
    - _Requirements: 8.1-8.7_

  - [ ] 12.2 Add liquidation execution logic
    - Implement atomic liquidation with repay and collateral seizure
    - Add liquidation bonus calculation (5% default)
    - Update both pool state and target user obligation
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ] 12.3 Add liquidation event emission
    - Implement LiquidationExecuted event structure
    - Add comprehensive event data for liquidation tracking
    - _Requirements: 8.6, 14.5_

  - [ ] 12.4 Write property tests for liquidation
    - **Property 5: Liquidations only execute when health_factor < 1.0**
    - **Validates: Requirements 8.2, 8.7**

  - [ ] 12.5 Write unit tests for liquidation instruction
    - Test successful liquidation of undercollateralized position
    - Test rejection of healthy positions
    - Test liquidation bonus calculations
    - _Requirements: 8.1-8.7_

- [ ] 13. Implement update_obligation instruction
  - [ ] 13.1 Create UpdateObligation accounts struct and instruction
    - Define account constraints for MXE-initiated updates
    - Implement attestation verification for state updates
    - Add encrypted state blob and commitment updates
    - _Requirements: 12.1-12.6_

  - [ ] 13.2 Write unit tests for obligation updates
    - Test successful state updates with valid attestations
    - Test rejection of invalid attestations
    - Test timestamp and commitment validation
    - _Requirements: 12.1-12.6, 9.1-9.6_

- [ ] 14. Implement error handling and validation
  - [ ] 14.1 Define comprehensive error enum
    - Create LendingError enum with all required error types
    - Add descriptive error messages for each error case
    - Include math overflow/underflow error handling
    - _Requirements: 13.1-13.6_

  - [ ] 14.2 Add input validation throughout instructions
    - Implement amount validation (non-zero, reasonable limits)
    - Add account ownership and constraint validation
    - Include authorization checks for admin operations
    - _Requirements: 13.1-13.6_

  - [ ] 14.3 Write unit tests for error conditions
    - Test all error cases with appropriate inputs
    - Test unauthorized access attempts
    - Test invalid parameter handling
    - _Requirements: 13.1-13.6_

- [ ] 15. Add comprehensive event system
  - [ ] 15.1 Define all event structures
    - Implement all required event structs with proper fields
    - Add InterestAccrued event for rate updates
    - Include timestamp and relevant identifiers in all events
    - _Requirements: 14.1-14.5_

  - [ ] 15.2 Integrate event emission throughout instructions
    - Add event emission to all successful operations
    - Include relevant data for external monitoring
    - Ensure events are emitted after state changes are complete
    - _Requirements: 14.1-14.5_

- [ ] 16. Write integration tests
  - Test complete user flows (deposit → borrow → repay → withdraw)
  - Test liquidation scenarios with multiple users
  - Test interest accrual over time with multiple operations
  - _Requirements: All requirements_

- [ ] 17. Final checkpoint - Complete implementation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are implemented and tested
  - Review code for security best practices and optimizations

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation assumes Arcium MXE integration will be added via CPI calls
- All encrypted state management is handled through MXE attestation verification