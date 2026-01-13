# Design Document

## Introduction

This document provides the technical design for ShadowLend's Solana Smart Contracts, translating the requirements into concrete implementation specifications. The design focuses on the on-chain components that manage lending pools, encrypted user obligations, and integration with Arcium's MXE network for privacy-preserving computation.

## System Overview

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Solana Smart Contracts                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Pool Program  │  │ Arcium Config   │  │   Oracle Feed   │ │
│  │                 │  │   Registry      │  │   Integration   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Arcium MXE Network                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Encrypted State │  │ Health Factor   │  │  Liquidation    │ │
│  │   Management    │  │  Computation    │  │    Engine       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Structures

### 1. Pool Account Structure

```rust
#[account]
pub struct Pool {
    /// Pool authority (admin)
    pub authority: Pubkey,
    
    /// Token mint for this pool
    pub mint: Pubkey,
    
    /// Token vault holding pool liquidity
    pub token_vault: Pubkey,
    
    /// Total deposits in the pool (public aggregate)
    pub total_deposits: u128,
    
    /// Total borrows from the pool (public aggregate)
    pub total_borrows: u128,
    
    /// Accumulated interest for the pool
    pub accumulated_interest: u128,
    
    /// Current utilization rate (basis points: 0-100000)
    pub utilization_rate: u64,
    
    /// Current borrow APY (basis points)
    pub current_borrow_rate: u64,
    
    /// Current deposit APY (basis points)
    pub current_deposit_rate: u64,
    
    /// Liquidation threshold (basis points, default 8000 = 80%)
    pub liquidation_threshold: u16,
    
    /// Last update timestamp
    pub last_update_ts: i64,
    
    /// Reference to Arcium configuration
    pub arcium_config: Pubkey,
    
    /// Interest rate model parameters
    pub interest_model: InterestRateModel,
    
    /// Pool bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InterestRateModel {
    /// Base interest rate (basis points)
    pub base_rate: u64,
    
    /// Optimal utilization rate (basis points, default 8000 = 80%)
    pub optimal_utilization: u64,
    
    /// Slope 1 - rate increase below optimal utilization
    pub slope1: u64,
    
    /// Slope 2 - rate increase above optimal utilization
    pub slope2: u64,
    
    /// Reserve factor (basis points, default 1000 = 10%)
    pub reserve_factor: u64,
}
```

### 2. User Obligation Account Structure

```rust
#[account]
pub struct UserObligation {
    /// User's public key
    pub user: Pubkey,
    
    /// Pool this obligation belongs to
    pub pool: Pubkey,
    
    /// Encrypted state blob (AES-256-GCM encrypted UserState)
    pub encrypted_state_blob: Vec<u8>,
    
    /// SHA-256 commitment of encrypted state for integrity
    pub state_commitment: [u8; 32],
    
    /// Last MXE attestation received
    pub last_mxe_attestation: Option<MxeAttestation>,
    
    /// Last update timestamp
    pub last_update_ts: i64,
    
    /// Obligation bump seed for PDA
    pub bump: u8,
}

/// Encrypted user state (only MXE can decrypt)
#[derive(Serialize, Deserialize, Clone)]
pub struct UserState {
    /// Total deposited amount
    pub deposit_amount: u128,
    
    /// Total borrowed amount
    pub borrow_amount: u128,
    
    /// Accrued interest on borrows
    pub accrued_interest: u128,
    
    /// Collateral assets and amounts
    pub collateral_assets: Vec<CollateralAsset>,
    
    /// Last interest calculation timestamp
    pub last_interest_calc_ts: i64,
    
    /// Health factor (computed by MXE)
    pub health_factor: Option<u64>, // Basis points
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CollateralAsset {
    /// Token mint
    pub mint: Pubkey,
    
    /// Amount deposited
    pub amount: u64,
    
    /// Last price used (for staleness detection)
    pub last_price: u64,
    
    /// Price timestamp
    pub price_timestamp: i64,
}
```

### 3. Arcium Configuration Structure

```rust
#[account]
pub struct ArciumConfig {
    /// Configuration authority
    pub authority: Pubkey,
    
    /// Registry of trusted MXE nodes
    pub mxe_registry: Vec<MxeNodeInfo>,
    
    /// Minimum number of attestations required
    pub min_attestations: u8,
    
    /// Maximum attestation age (seconds)
    pub max_attestation_age: i64,
    
    /// Configuration bump seed
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MxeNodeInfo {
    /// MXE node public key
    pub node_pubkey: Pubkey,
    
    /// Ed25519 key for attestation verification
    pub attestation_key: [u8; 32],
    
    /// TEE enclave measurement (MRENCLAVE)
    pub enclave_measurement: [u8; 32],
    
    /// Whether this node is active
    pub is_active: bool,
    
    /// Node registration timestamp
    pub registered_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MxeAttestation {
    /// MXE node that generated this attestation
    pub mxe_node: Pubkey,
    
    /// Ed25519 signature over attestation data
    pub signature: [u8; 64],
    
    /// TEE enclave measurement
    pub mrenclave: [u8; 32],
    
    /// Attestation timestamp
    pub timestamp: i64,
    
    /// Hash of the computation result
    pub result_hash: [u8; 32],
    
    /// Computation type (deposit, borrow, liquidate, etc.)
    pub computation_type: ComputationType,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum ComputationType {
    Deposit,
    Borrow,
    Repay,
    Withdraw,
    Liquidate,
    InterestAccrual,
}
```

## Program Instructions

### 1. Pool Management Instructions

#### Initialize Pool
```rust
#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = Pool::LEN,
        seeds = [b"pool", mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = pool,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,
    
    pub arcium_config: Account<'info, ArciumConfig>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_pool(
    ctx: Context<InitializePool>,
    interest_model: InterestRateModel,
    liquidation_threshold: u16,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    
    pool.authority = ctx.accounts.authority.key();
    pool.mint = ctx.accounts.mint.key();
    pool.token_vault = ctx.accounts.token_vault.key();
    pool.total_deposits = 0;
    pool.total_borrows = 0;
    pool.accumulated_interest = 0;
    pool.utilization_rate = 0;
    pool.current_borrow_rate = interest_model.base_rate;
    pool.current_deposit_rate = 0;
    pool.liquidation_threshold = liquidation_threshold;
    pool.last_update_ts = Clock::get()?.unix_timestamp;
    pool.arcium_config = ctx.accounts.arcium_config.key();
    pool.interest_model = interest_model;
    pool.bump = ctx.bumps.pool;
    
    Ok(())
}
```

### 2. User Operation Instructions

#### Deposit Instruction
```rust
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = UserObligation::LEN,
        seeds = [b"obligation", user.key().as_ref(), pool.key().as_ref()],
        bump
    )]
    pub user_obligation: Account<'info, UserObligation>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == pool.mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = pool_token_vault.key() == pool.token_vault
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,
    
    pub arcium_config: Account<'info, ArciumConfig>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn deposit(
    ctx: Context<Deposit>,
    amount: u64,
    encrypted_data: Vec<u8>,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let user_obligation = &mut ctx.accounts.user_obligation;
    
    // Validate deposit amount
    require!(amount > 0, LendingError::InvalidAmount);
    
    // Transfer tokens from user to pool vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.pool_token_vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;
    
    // Initialize user obligation if needed
    if user_obligation.user == Pubkey::default() {
        user_obligation.user = ctx.accounts.user.key();
        user_obligation.pool = pool.key();
        user_obligation.encrypted_state_blob = Vec::new();
        user_obligation.state_commitment = [0; 32];
        user_obligation.last_mxe_attestation = None;
        user_obligation.last_update_ts = Clock::get()?.unix_timestamp;
        user_obligation.bump = ctx.bumps.user_obligation;
    }
    
    // Forward to Arcium MXE for encrypted state update
    // This would be a CPI call to Arcium program
    let mxe_result = forward_to_arcium_mxe(
        &ctx.accounts.arcium_config,
        encrypted_data,
        ComputationType::Deposit,
        amount,
    )?;
    
    // Verify MXE attestation
    verify_mxe_attestation(
        &mxe_result.attestation,
        &ctx.accounts.user.key(),
        &mxe_result.state_commitment,
        &ctx.accounts.arcium_config,
    )?;
    
    // Update user obligation with encrypted state
    user_obligation.encrypted_state_blob = mxe_result.encrypted_state_blob;
    user_obligation.state_commitment = mxe_result.state_commitment;
    user_obligation.last_mxe_attestation = Some(mxe_result.attestation);
    user_obligation.last_update_ts = Clock::get()?.unix_timestamp;
    
    // Update pool state
    pool.total_deposits = pool.total_deposits
        .checked_add(amount as u128)
        .ok_or(LendingError::MathOverflow)?;
    
    update_interest_rates(pool)?;
    
    // Emit event
    emit!(DepositCompleted {
        pool: pool.key(),
        user: ctx.accounts.user.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

#### Borrow Instruction
```rust
#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"obligation", user.key().as_ref(), pool.key().as_ref()],
        bump = user_obligation.bump,
        constraint = user_obligation.user == user.key(),
        constraint = user_obligation.pool == pool.key()
    )]
    pub user_obligation: Account<'info, UserObligation>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == pool.mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = pool_token_vault.key() == pool.token_vault
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,
    
    pub arcium_config: Account<'info, ArciumConfig>,
    
    pub token_program: Program<'info, Token>,
}

pub fn borrow(
    ctx: Context<Borrow>,
    amount: u64,
    encrypted_request: Vec<u8>,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let user_obligation = &mut ctx.accounts.user_obligation;
    
    // Validate borrow amount
    require!(amount > 0, LendingError::InvalidAmount);
    
    // Check pool has sufficient liquidity
    let available_liquidity = ctx.accounts.pool_token_vault.amount;
    require!(
        available_liquidity >= amount,
        LendingError::InsufficientPoolLiquidity
    );
    
    // Forward to Arcium MXE for health factor validation
    let mxe_result = forward_to_arcium_mxe(
        &ctx.accounts.arcium_config,
        encrypted_request,
        ComputationType::Borrow,
        amount,
    )?;
    
    // Verify MXE attestation and approval
    verify_mxe_attestation(
        &mxe_result.attestation,
        &ctx.accounts.user.key(),
        &mxe_result.state_commitment,
        &ctx.accounts.arcium_config,
    )?;
    
    // Check if MXE approved the borrow (health factor >= 1.0)
    require!(mxe_result.approved, LendingError::InsufficientCollateral);
    
    // Transfer tokens from pool vault to user
    let pool_key = pool.key();
    let seeds = &[b"pool", pool.mint.as_ref(), &[pool.bump]];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = Transfer {
        from: ctx.accounts.pool_token_vault.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: pool.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;
    
    // Update user obligation
    user_obligation.encrypted_state_blob = mxe_result.encrypted_state_blob;
    user_obligation.state_commitment = mxe_result.state_commitment;
    user_obligation.last_mxe_attestation = Some(mxe_result.attestation);
    user_obligation.last_update_ts = Clock::get()?.unix_timestamp;
    
    // Update pool state
    pool.total_borrows = pool.total_borrows
        .checked_add(amount as u128)
        .ok_or(LendingError::MathOverflow)?;
    
    update_interest_rates(pool)?;
    
    // Emit event
    emit!(BorrowCompleted {
        pool: pool.key(),
        user: ctx.accounts.user.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

### 3. Liquidation Instruction

```rust
#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,
    
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"obligation", target_user.key().as_ref(), pool.key().as_ref()],
        bump = target_obligation.bump
    )]
    pub target_obligation: Account<'info, UserObligation>,
    
    /// CHECK: Target user being liquidated
    pub target_user: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = liquidator_token_account.mint == pool.mint,
        constraint = liquidator_token_account.owner == liquidator.key()
    )]
    pub liquidator_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = pool_token_vault.key() == pool.token_vault
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,
    
    pub arcium_config: Account<'info, ArciumConfig>,
    
    pub token_program: Program<'info, Token>,
}

pub fn liquidate(
    ctx: Context<Liquidate>,
    repay_amount: u64,
    encrypted_request: Vec<u8>,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let target_obligation = &mut ctx.accounts.target_obligation;
    
    // Forward to Arcium MXE for liquidation validation
    let mxe_result = forward_to_arcium_mxe(
        &ctx.accounts.arcium_config,
        encrypted_request,
        ComputationType::Liquidate,
        repay_amount,
    )?;
    
    // Verify MXE attestation
    verify_mxe_attestation(
        &mxe_result.attestation,
        &ctx.accounts.target_user.key(),
        &mxe_result.state_commitment,
        &ctx.accounts.arcium_config,
    )?;
    
    // Check if liquidation is valid (health factor < 1.0)
    require!(mxe_result.approved, LendingError::PositionNotLiquidatable);
    
    let liquidation_params = mxe_result.liquidation_params.unwrap();
    
    // Transfer repay amount from liquidator to pool
    let cpi_accounts = Transfer {
        from: ctx.accounts.liquidator_token_account.to_account_info(),
        to: ctx.accounts.pool_token_vault.to_account_info(),
        authority: ctx.accounts.liquidator.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, liquidation_params.actual_repay_amount)?;
    
    // Transfer collateral from pool to liquidator (including bonus)
    let pool_key = pool.key();
    let seeds = &[b"pool", pool.mint.as_ref(), &[pool.bump]];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = Transfer {
        from: ctx.accounts.pool_token_vault.to_account_info(),
        to: ctx.accounts.liquidator_token_account.to_account_info(),
        authority: pool.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, liquidation_params.collateral_to_seize)?;
    
    // Update target user obligation
    target_obligation.encrypted_state_blob = mxe_result.encrypted_state_blob;
    target_obligation.state_commitment = mxe_result.state_commitment;
    target_obligation.last_mxe_attestation = Some(mxe_result.attestation);
    target_obligation.last_update_ts = Clock::get()?.unix_timestamp;
    
    // Update pool state
    pool.total_borrows = pool.total_borrows
        .checked_sub(liquidation_params.actual_repay_amount as u128)
        .ok_or(LendingError::MathUnderflow)?;
    
    pool.total_deposits = pool.total_deposits
        .checked_sub(liquidation_params.collateral_to_seize as u128)
        .ok_or(LendingError::MathUnderflow)?;
    
    update_interest_rates(pool)?;
    
    // Emit event
    emit!(LiquidationExecuted {
        pool: pool.key(),
        liquidator: ctx.accounts.liquidator.key(),
        target_user: ctx.accounts.target_user.key(),
        repay_amount: liquidation_params.actual_repay_amount,
        collateral_seized: liquidation_params.collateral_to_seize,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}
```

## Utility Functions

### Interest Rate Calculation

```rust
pub fn update_interest_rates(pool: &mut Pool) -> Result<()> {
    let utilization = if pool.total_deposits == 0 {
        0
    } else {
        ((pool.total_borrows * 100000) / pool.total_deposits) as u64
    };
    
    pool.utilization_rate = utilization;
    
    let model = &pool.interest_model;
    
    // Calculate borrow rate based on utilization
    let borrow_rate = if utilization <= model.optimal_utilization {
        // Below optimal: base_rate + (utilization * slope1)
        model.base_rate + (utilization * model.slope1) / 100000
    } else {
        // Above optimal: base_rate + (optimal * slope1) + ((utilization - optimal) * slope2)
        let excess_utilization = utilization - model.optimal_utilization;
        model.base_rate 
            + (model.optimal_utilization * model.slope1) / 100000
            + (excess_utilization * model.slope2) / 100000
    };
    
    pool.current_borrow_rate = borrow_rate;
    
    // Calculate deposit rate: borrow_rate * utilization * (1 - reserve_factor)
    let deposit_rate = (borrow_rate * utilization * (100000 - model.reserve_factor)) 
        / (100000 * 100000);
    
    pool.current_deposit_rate = deposit_rate;
    
    pool.last_update_ts = Clock::get()?.unix_timestamp;
    
    Ok(())
}
```

### Attestation Verification

```rust
pub fn verify_mxe_attestation(
    attestation: &MxeAttestation,
    user_pubkey: &Pubkey,
    expected_commitment: &[u8; 32],
    arcium_config: &Account<ArciumConfig>,
) -> Result<()> {
    // Find the MXE node in registry
    let mxe_node = arcium_config
        .mxe_registry
        .iter()
        .find(|node| node.node_pubkey == attestation.mxe_node && node.is_active)
        .ok_or(LendingError::InvalidMxeNode)?;
    
    // Verify attestation signature
    let message = [
        user_pubkey.as_ref(),
        expected_commitment,
        &attestation.timestamp.to_le_bytes(),
        &attestation.result_hash,
    ].concat();
    
    // Verify Ed25519 signature
    let signature = ed25519_dalek::Signature::from_bytes(&attestation.signature)
        .map_err(|_| LendingError::InvalidAttestation)?;
    
    let public_key = ed25519_dalek::PublicKey::from_bytes(&mxe_node.attestation_key)
        .map_err(|_| LendingError::InvalidAttestation)?;
    
    public_key.verify(&message, &signature)
        .map_err(|_| LendingError::InvalidAttestation)?;
    
    // Verify enclave measurement
    require_eq!(
        attestation.mrenclave,
        mxe_node.enclave_measurement,
        LendingError::InvalidEnclaveMeasurement
    );
    
    // Verify freshness
    let now = Clock::get()?.unix_timestamp;
    let age = (now - attestation.timestamp).abs();
    require!(
        age <= arcium_config.max_attestation_age,
        LendingError::AttestationTooOld
    );
    
    Ok(())
}
```

## Events

```rust
#[event]
pub struct DepositCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct BorrowCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RepayCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawCompleted {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct LiquidationExecuted {
    pub pool: Pubkey,
    pub liquidator: Pubkey,
    pub target_user: Pubkey,
    pub repay_amount: u64,
    pub collateral_seized: u64,
    pub timestamp: i64,
}

#[event]
pub struct InterestAccrued {
    pub pool: Pubkey,
    pub total_interest: u128,
    pub new_borrow_rate: u64,
    pub new_deposit_rate: u64,
    pub timestamp: i64,
}
```

## Error Definitions

```rust
#[error_code]
pub enum LendingError {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    
    #[msg("Insufficient pool liquidity")]
    InsufficientPoolLiquidity,
    
    #[msg("Insufficient user balance")]
    InsufficientUserBalance,
    
    #[msg("Insufficient collateral for borrow")]
    InsufficientCollateral,
    
    #[msg("Invalid MXE attestation")]
    InvalidAttestation,
    
    #[msg("MXE node not registered or inactive")]
    InvalidMxeNode,
    
    #[msg("Invalid enclave measurement")]
    InvalidEnclaveMeasurement,
    
    #[msg("Attestation too old")]
    AttestationTooOld,
    
    #[msg("Position not liquidatable")]
    PositionNotLiquidatable,
    
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("Math overflow")]
    MathOverflow,
    
    #[msg("Math underflow")]
    MathUnderflow,
    
    #[msg("Invalid pool state")]
    InvalidPoolState,
    
    #[msg("Oracle price too stale")]
    StalePriceData,
}
```

## Arcium Integration

### MXE Result Structure

```rust
#[derive(Serialize, Deserialize)]
pub struct MxeResult {
    /// Whether the operation was approved
    pub approved: bool,
    
    /// Updated encrypted state blob
    pub encrypted_state_blob: Vec<u8>,
    
    /// State commitment hash
    pub state_commitment: [u8; 32],
    
    /// MXE attestation
    pub attestation: MxeAttestation,
    
    /// Liquidation parameters (if applicable)
    pub liquidation_params: Option<LiquidationParams>,
    
    /// Error message (if not approved)
    pub error_message: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct LiquidationParams {
    /// Actual amount to repay
    pub actual_repay_amount: u64,
    
    /// Collateral amount to seize (including bonus)
    pub collateral_to_seize: u64,
    
    /// Liquidation bonus percentage (basis points)
    pub liquidation_bonus: u16,
    
    /// User's health factor before liquidation
    pub health_factor_before: u64,
    
    /// User's health factor after liquidation
    pub health_factor_after: u64,
}
```

### Forward to Arcium Function

```rust
pub fn forward_to_arcium_mxe(
    arcium_config: &Account<ArciumConfig>,
    encrypted_data: Vec<u8>,
    computation_type: ComputationType,
    amount: u64,
) -> Result<MxeResult> {
    // This would be implemented as a CPI call to the Arcium program
    // For now, this is a placeholder that shows the expected interface
    
    let mxe_request = MxeRequest {
        encrypted_data,
        computation_type,
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    };
    
    // CPI to Arcium program would happen here
    // The actual implementation depends on Arcium's SDK
    
    // Placeholder return - in reality this comes from MXE
    Ok(MxeResult {
        approved: true,
        encrypted_state_blob: vec![],
        state_commitment: [0; 32],
        attestation: MxeAttestation {
            mxe_node: Pubkey::default(),
            signature: [0; 64],
            mrenclave: [0; 32],
            timestamp: Clock::get()?.unix_timestamp,
            result_hash: [0; 32],
            computation_type,
        },
        liquidation_params: None,
        error_message: None,
    })
}

#[derive(Serialize, Deserialize)]
pub struct MxeRequest {
    pub encrypted_data: Vec<u8>,
    pub computation_type: ComputationType,
    pub amount: u64,
    pub timestamp: i64,
}
```

## Security Considerations

### 1. Access Control
- Pool authority can only initialize pools and update configurations
- Users can only modify their own obligations
- MXE nodes must be registered and active to provide attestations

### 2. State Integrity
- All encrypted state changes must be accompanied by valid MXE attestations
- State commitments ensure encrypted blobs haven't been tampered with
- Timestamp checks prevent replay attacks

### 3. Economic Security
- Interest rate model prevents extreme rate fluctuations
- Liquidation thresholds ensure protocol solvency
- Reserve factors provide protocol revenue and safety buffer

### 4. Oracle Security
- Price feeds must be recent (configurable staleness threshold)
- Multiple price sources can be aggregated for robustness
- Circuit breakers can halt operations if price feeds fail

## Testing Strategy

### Unit Tests
- Test each instruction in isolation
- Mock MXE responses for deterministic testing
- Verify error conditions and edge cases

### Integration Tests
- Test complete user flows (deposit → borrow → repay)
- Test liquidation scenarios with price changes
- Test interest accrual over time

### Security Tests
- Test attestation verification with invalid signatures
- Test replay attack prevention
- Test unauthorized access attempts

## Deployment Considerations

### Program Deployment
- Deploy to Devnet first for testing
- Comprehensive audit before Mainnet deployment
- Gradual rollout with deposit caps initially

### Configuration Management
- Secure key management for program authority
- Multi-signature for critical operations
- Emergency pause functionality

### Monitoring
- Track pool utilization and interest rates
- Monitor attestation verification success rates
- Alert on unusual liquidation activity

This design provides a comprehensive technical specification for implementing the ShadowLend Solana smart contracts with Arcium MXE integration, ensuring privacy-preserving lending operations while maintaining protocol security and correctness.