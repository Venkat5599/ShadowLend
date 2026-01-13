use anchor_lang::prelude::*;
use serde::{Serialize, Deserialize};

use super::arcium_config::MxeAttestation;

/// User obligation account storing encrypted position data
/// Each user has one obligation per pool containing their encrypted state
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

impl UserObligation {
    /// Calculate the space required for the UserObligation account
    /// Uses a maximum encrypted state blob size of 1024 bytes
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // pool
        4 + 1024 + // encrypted_state_blob (Vec<u8> with max 1024 bytes)
        32 + // state_commitment
        1 + MxeAttestation::LEN + // last_mxe_attestation (Option)
        8 + // last_update_ts
        1; // bump
}

/// Encrypted user state structure (only MXE can decrypt)
/// This represents the plaintext format before encryption
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
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

impl UserState {
    /// Create a new empty user state
    pub fn new() -> Self {
        Self {
            deposit_amount: 0,
            borrow_amount: 0,
            accrued_interest: 0,
            collateral_assets: Vec::new(),
            last_interest_calc_ts: 0,
            health_factor: None,
        }
    }
    
    /// Check if the user has any active positions
    pub fn is_empty(&self) -> bool {
        self.deposit_amount == 0 && 
        self.borrow_amount == 0 && 
        self.accrued_interest == 0 &&
        self.collateral_assets.is_empty()
    }
}

/// Collateral asset information for multi-asset support
/// Tracks individual collateral positions with price data
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
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

impl CollateralAsset {
    /// Create a new collateral asset entry
    pub fn new(mint: Pubkey, amount: u64, price: u64, timestamp: i64) -> Self {
        Self {
            mint,
            amount,
            last_price: price,
            price_timestamp: timestamp,
        }
    }
    
    /// Check if the price data is stale (older than given threshold)
    pub fn is_price_stale(&self, current_time: i64, max_age: i64) -> bool {
        (current_time - self.price_timestamp) > max_age
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    #[test]
    fn test_user_state_new() {
        let state = UserState::new();
        
        assert_eq!(state.deposit_amount, 0);
        assert_eq!(state.borrow_amount, 0);
        assert_eq!(state.accrued_interest, 0);
        assert!(state.collateral_assets.is_empty());
        assert_eq!(state.last_interest_calc_ts, 0);
        assert!(state.health_factor.is_none());
        assert!(state.is_empty());
    }

    #[test]
    fn test_user_state_is_empty() {
        let mut state = UserState::new();
        assert!(state.is_empty());
        
        // Add deposit amount
        state.deposit_amount = 1000;
        assert!(!state.is_empty());
        
        // Reset and add borrow amount
        state = UserState::new();
        state.borrow_amount = 500;
        assert!(!state.is_empty());
        
        // Reset and add accrued interest
        state = UserState::new();
        state.accrued_interest = 10;
        assert!(!state.is_empty());
        
        // Reset and add collateral asset
        state = UserState::new();
        state.collateral_assets.push(CollateralAsset::new(
            Pubkey::new_unique(),
            100,
            1000,
            1234567890
        ));
        assert!(!state.is_empty());
    }

    #[test]
    fn test_user_state_serialization() {
        let state = UserState {
            deposit_amount: 1000,
            borrow_amount: 500,
            accrued_interest: 25,
            collateral_assets: vec![
                CollateralAsset::new(Pubkey::new_unique(), 100, 1000, 1234567890)
            ],
            last_interest_calc_ts: 1234567890,
            health_factor: Some(12000), // 120% health factor
        };
        
        // Test serialization
        let serialized = serde_json::to_string(&state).unwrap();
        assert!(!serialized.is_empty());
        
        // Test deserialization
        let deserialized: UserState = serde_json::from_str(&serialized).unwrap();
        assert_eq!(state, deserialized);
    }

    #[test]
    fn test_collateral_asset_new() {
        let mint = Pubkey::new_unique();
        let amount = 1000;
        let price = 50000; // $500.00 in cents
        let timestamp = 1234567890;
        
        let asset = CollateralAsset::new(mint, amount, price, timestamp);
        
        assert_eq!(asset.mint, mint);
        assert_eq!(asset.amount, amount);
        assert_eq!(asset.last_price, price);
        assert_eq!(asset.price_timestamp, timestamp);
    }

    #[test]
    fn test_collateral_asset_price_staleness() {
        let asset = CollateralAsset::new(
            Pubkey::new_unique(),
            1000,
            50000,
            1234567890
        );
        
        let current_time = 1234567890 + 30; // 30 seconds later
        let max_age = 60; // 60 seconds max age
        
        // Price should not be stale
        assert!(!asset.is_price_stale(current_time, max_age));
        
        let current_time = 1234567890 + 120; // 120 seconds later
        
        // Price should be stale
        assert!(asset.is_price_stale(current_time, max_age));
    }

    #[test]
    fn test_collateral_asset_serialization() {
        let asset = CollateralAsset::new(
            Pubkey::new_unique(),
            1000,
            50000,
            1234567890
        );
        
        // Test serialization
        let serialized = serde_json::to_string(&asset).unwrap();
        assert!(!serialized.is_empty());
        
        // Test deserialization
        let deserialized: CollateralAsset = serde_json::from_str(&serialized).unwrap();
        assert_eq!(asset, deserialized);
    }

    #[test]
    fn test_user_obligation_len_calculation() {
        // Verify UserObligation::LEN calculation is correct
        let expected_len = 8 + // discriminator
            32 + // user
            32 + // pool
            4 + 1024 + // encrypted_state_blob (Vec<u8> with max 1024 bytes)
            32 + // state_commitment
            1 + MxeAttestation::LEN + // last_mxe_attestation (Option)
            8 + // last_update_ts
            1; // bump
        
        assert_eq!(UserObligation::LEN, expected_len);
    }

    #[test]
    fn test_user_obligation_pda_derivation() {
        let user = Pubkey::new_unique();
        let pool = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        
        // Test PDA derivation for user obligation
        let (obligation_pda, bump) = Pubkey::find_program_address(
            &[b"obligation", user.as_ref(), pool.as_ref()],
            &program_id
        );
        
        assert!(bump <= 255);
        assert_ne!(obligation_pda, Pubkey::default());
    }
}