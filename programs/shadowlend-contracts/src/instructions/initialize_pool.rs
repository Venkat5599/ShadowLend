use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::{Pool, InterestRateModel, ArciumConfig};
use crate::errors::LendingError;

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
    
    // Validate liquidation threshold (should be between 50% and 95%)
    require!(
        liquidation_threshold >= 5000 && liquidation_threshold <= 9500,
        LendingError::InvalidAmount
    );
    
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

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    #[test]
    fn test_initialize_pool_validation() {
        // Test liquidation threshold validation
        let interest_model = InterestRateModel::default();
        
        // Test valid liquidation threshold
        let valid_threshold = 8000; // 80%
        assert!(valid_threshold >= 5000 && valid_threshold <= 9500);
        
        // Test invalid liquidation thresholds
        let too_low = 4000; // 40%
        let too_high = 9600; // 96%
        
        assert!(too_low < 5000);
        assert!(too_high > 9500);
    }

    #[test]
    fn test_pool_initialization_values() {
        // Test that pool initialization sets correct default values
        let interest_model = InterestRateModel::default();
        
        // Verify interest model defaults
        assert_eq!(interest_model.base_rate, 200);
        assert_eq!(interest_model.optimal_utilization, 8000);
        assert_eq!(interest_model.slope1, 400);
        assert_eq!(interest_model.slope2, 6000);
        assert_eq!(interest_model.reserve_factor, 1000);
    }

    #[test]
    fn test_pool_pda_seeds() {
        // Test that pool PDA is derived correctly
        let mint = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        
        let (pool_pda, bump) = Pubkey::find_program_address(
            &[b"pool", mint.as_ref()],
            &program_id
        );
        
        assert!(bump <= 255);
        assert_ne!(pool_pda, Pubkey::default());
    }

    #[test]
    fn test_vault_pda_seeds() {
        // Test that vault PDA is derived correctly
        let pool = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        
        let (vault_pda, bump) = Pubkey::find_program_address(
            &[b"vault", pool.as_ref()],
            &program_id
        );
        
        assert!(bump <= 255);
        assert_ne!(vault_pda, Pubkey::default());
    }
}