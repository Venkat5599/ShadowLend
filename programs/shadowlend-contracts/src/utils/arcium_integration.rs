use anchor_lang::prelude::*;

use crate::state::{ArciumConfig, MxeAttestation, ComputationType};

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

pub struct MxeRequest {
    pub encrypted_data: Vec<u8>,
    pub computation_type: ComputationType,
    pub amount: u64,
    pub timestamp: i64,
}

pub fn forward_to_arcium_mxe(
    arcium_config: &Account<ArciumConfig>,
    encrypted_data: Vec<u8>,
    computation_type: ComputationType,
    amount: u64,
) -> Result<MxeResult> {
    // This would be implemented as a CPI call to the Arcium program
    // For now, this is a placeholder that shows the expected interface
    
    let _mxe_request = MxeRequest {
        encrypted_data,
        computation_type: computation_type.clone(),
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