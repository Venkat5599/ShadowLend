use anchor_lang::prelude::*;

// Program ID - This will be updated when deployed
declare_id!("11111111111111111111111111111111");

pub mod instructions;
pub mod state;
pub mod errors;
pub mod events;
pub mod utils;

// Re-export commonly used types
pub use state::{InterestRateModel, MxeAttestation, ComputationType};
// Re-export instruction structs
pub use instructions::{
    InitializePool, InitializeArciumConfig
};

#[program]
pub mod shadowlend_contracts {
    use super::*;

    /// Initialize a new lending pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        interest_model: InterestRateModel,
        liquidation_threshold: u16,
    ) -> Result<()> {
        instructions::initialize_pool::initialize_pool(ctx, interest_model, liquidation_threshold)
    }

    /// Initialize Arcium configuration
    pub fn initialize_arcium_config(
        ctx: Context<InitializeArciumConfig>,
        min_attestations: u8,
        max_attestation_age: i64,
    ) -> Result<()> {
        instructions::initialize_arcium_config::initialize_arcium_config(ctx, min_attestations, max_attestation_age)
    }

    /// Deposit tokens into a lending pool
    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
        encrypted_data: Vec<u8>,
    ) -> Result<()> {
        // instructions::deposit(ctx, amount, encrypted_data)
        Ok(())
    }

    /// Borrow tokens from a lending pool
    pub fn borrow(
        ctx: Context<Borrow>,
        amount: u64,
        encrypted_request: Vec<u8>,
    ) -> Result<()> {
        // instructions::borrow(ctx, amount, encrypted_request)
        Ok(())
    }

    /// Repay borrowed tokens
    pub fn repay(
        ctx: Context<Repay>,
        amount: u64,
        encrypted_data: Vec<u8>,
    ) -> Result<()> {
        // instructions::repay(ctx, amount, encrypted_data)
        Ok(())
    }

    /// Withdraw deposited tokens
    pub fn withdraw(
        ctx: Context<Withdraw>,
        amount: u64,
        encrypted_request: Vec<u8>,
    ) -> Result<()> {
        // instructions::withdraw(ctx, amount, encrypted_request)
        Ok(())
    }

    /// Liquidate an undercollateralized position
    pub fn liquidate(
        ctx: Context<Liquidate>,
        repay_amount: u64,
        encrypted_request: Vec<u8>,
    ) -> Result<()> {
        // instructions::liquidate(ctx, repay_amount, encrypted_request)
        Ok(())
    }

    /// Update user obligation from MXE
    pub fn update_obligation(
        ctx: Context<UpdateObligation>,
        encrypted_state_blob: Vec<u8>,
        state_commitment: [u8; 32],
        attestation: MxeAttestation,
    ) -> Result<()> {
        // instructions::update_obligation(ctx, encrypted_state_blob, state_commitment, attestation)
        Ok(())
    }
}

// Placeholder structs for compilation - these will be replaced by actual instruction structs
#[derive(Accounts)]
pub struct Deposit {}

#[derive(Accounts)]
pub struct Borrow {}

#[derive(Accounts)]
pub struct Repay {}

#[derive(Accounts)]
pub struct Withdraw {}

#[derive(Accounts)]
pub struct Liquidate {}

#[derive(Accounts)]
pub struct UpdateObligation {}