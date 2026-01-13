use anchor_lang::prelude::*;

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