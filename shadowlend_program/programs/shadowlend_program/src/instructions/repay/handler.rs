use anchor_lang::prelude::*;
use anchor_spl::token::{self};
use arcium_anchor::prelude::*;

use super::accounts::Repay;
use super::callback::ComputeConfidentialRepayCallback;
use crate::error::ErrorCode;

/// Queue repay computation to Arcium MXE
/// Token transfer happens in callback after verification
///
/// Flow:
/// 1. User encrypts repay amount client-side
/// 2. Handler queues computation
/// 3. MXE computes new borrow balance privately
/// 4. Callback transfers tokens from user to vault
pub fn repay_handler(
    ctx: Context<Repay>,
    computation_offset: u64,
    amount: u64,                // Plaintext amount for Atomic Repay
) -> Result<()> {
    // Validate repay amount
    require!(amount > 0, ErrorCode::InvalidBorrowAmount);

    // User must have existing state with borrow
    let user_obligation = &ctx.accounts.user_obligation;
    require!(
        !user_obligation.encrypted_state_blob.is_empty(),
        ErrorCode::InvalidBorrowAmount
    );

    // Set signer PDA bump for Arcium computation
    ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

    // 1. Perform Public SPL Transfer (Atomic Repay)
    let transfer_accounts = token::Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.borrow_vault.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_accounts),
        amount,
    )?;

    // Read encrypted state from on-chain UserObligation (prevent state injection attack)
    let mut encrypted_state = [0u8; 64];
    let len = user_obligation.encrypted_state_blob.len().min(64);
    encrypted_state[..len].copy_from_slice(&user_obligation.encrypted_state_blob[..len]);

    // Read pool state (MXE only)
    let pool = &ctx.accounts.pool;
    let encrypted_pool_state: [u8; 64] = if pool.encrypted_pool_state.is_empty() {
         [0u8; 64]
    } else {
         let mut state_arr = [0u8; 64];
        let len = pool.encrypted_pool_state.len().min(64);
        state_arr[..len].copy_from_slice(&pool.encrypted_pool_state[..len]);
        state_arr
    };

    // Build arguments for Arcium MXE computation
    // Order: amount, user_state, pool_state
    let args = ArgBuilder::new()
        .plaintext_u64(amount)
        .encrypted_u128(encrypted_state[0..32].try_into().unwrap())
        .encrypted_u128(encrypted_state[32..64].try_into().unwrap())
        .encrypted_u128(encrypted_pool_state[0..32].try_into().unwrap())
        .encrypted_u128(encrypted_pool_state[32..64].try_into().unwrap())
        .build();

    // Queue computation with callback instruction
    queue_computation(
        ctx.accounts,
        computation_offset,
        args,
        None, // No callback server
        vec![ComputeConfidentialRepayCallback::callback_ix(
            computation_offset,
            &ctx.accounts.mxe_account,
            &[],
        )?],
        1, // Number of callback transactions
        0, // Priority fee
    )?;

    msg!("Queued repay computation to Arcium MXE");

    // Emit event for indexer tracking
    emit!(RepayQueued {
        user: ctx.accounts.payer.key(),
        pool: ctx.accounts.pool.key(),
        computation_offset,
    });

    Ok(())
}

/// Event emitted when repay computation is queued
#[event]
pub struct RepayQueued {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub computation_offset: u64,
}
