use anchor_lang::prelude::*;

/// Pool account structure for lending pools
/// Stores public aggregates and configuration for a specific token mint
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

impl Pool {
    /// Calculate the space required for the Pool account
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // mint
        32 + // token_vault
        16 + // total_deposits
        16 + // total_borrows
        16 + // accumulated_interest
        8 + // utilization_rate
        8 + // current_borrow_rate
        8 + // current_deposit_rate
        2 + // liquidation_threshold
        8 + // last_update_ts
        32 + // arcium_config
        InterestRateModel::LEN + // interest_model
        1; // bump
}

/// Interest rate model parameters for calculating borrow and deposit rates
/// Uses a linear utilization-based model with two slopes
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
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

impl InterestRateModel {
    /// Calculate the space required for the InterestRateModel struct
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8; // 5 u64 fields = 40 bytes
    
    /// Create a default interest rate model with standard parameters
    pub fn default() -> Self {
        Self {
            base_rate: 200,           // 2% base rate
            optimal_utilization: 8000, // 80% optimal utilization
            slope1: 400,              // 4% slope below optimal
            slope2: 6000,             // 60% slope above optimal
            reserve_factor: 1000,     // 10% reserve factor
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    #[test]
    fn test_interest_rate_model_serialization() {
        let model = InterestRateModel::default();
        
        // Test serialization
        let serialized = model.try_to_vec().unwrap();
        assert!(!serialized.is_empty());
        
        // Test deserialization
        let deserialized: InterestRateModel = InterestRateModel::try_from_slice(&serialized).unwrap();
        assert_eq!(model, deserialized);
    }

    #[test]
    fn test_interest_rate_model_default_values() {
        let model = InterestRateModel::default();
        
        assert_eq!(model.base_rate, 200);
        assert_eq!(model.optimal_utilization, 8000);
        assert_eq!(model.slope1, 400);
        assert_eq!(model.slope2, 6000);
        assert_eq!(model.reserve_factor, 1000);
    }

    #[test]
    fn test_interest_rate_model_len() {
        let model = InterestRateModel::default();
        let serialized = model.try_to_vec().unwrap();
        
        // Verify the LEN constant matches actual serialized size
        assert_eq!(serialized.len(), InterestRateModel::LEN);
    }

    #[test]
    fn test_pool_len_calculation() {
        // Verify Pool::LEN calculation is correct
        let expected_len = 8 + // discriminator
            32 + // authority
            32 + // mint
            32 + // token_vault
            16 + // total_deposits
            16 + // total_borrows
            16 + // accumulated_interest
            8 + // utilization_rate
            8 + // current_borrow_rate
            8 + // current_deposit_rate
            2 + // liquidation_threshold
            8 + // last_update_ts
            32 + // arcium_config
            InterestRateModel::LEN + // interest_model
            1; // bump
        
        assert_eq!(Pool::LEN, expected_len);
    }

    #[test]
    fn test_pool_pda_derivation() {
        let mint = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        
        // Test PDA derivation for pool
        let (pool_pda, bump) = Pubkey::find_program_address(
            &[b"pool", mint.as_ref()],
            &program_id
        );
        
        assert!(bump <= 255);
        assert_ne!(pool_pda, Pubkey::default());
    }
}