use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{Pool, UserObligation, ArciumConfig, MxeAttestation, ComputationType};
use crate::errors::LendingError;
use crate::events::DepositCompleted;
use crate::utils::{forward_to_arcium_mxe, verify_mxe_attestation, update_interest_rates};

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