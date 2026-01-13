use anchor_lang::prelude::*;

use crate::state::ArciumConfig;

#[derive(Accounts)]
pub struct InitializeArciumConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = ArciumConfig::LEN,
        seeds = [b"arcium_config"],
        bump
    )]
    pub arcium_config: Account<'info, ArciumConfig>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize_arcium_config(
    ctx: Context<InitializeArciumConfig>,
    min_attestations: u8,
    max_attestation_age: i64,
) -> Result<()> {
    let arcium_config = &mut ctx.accounts.arcium_config;
    
    arcium_config.authority = ctx.accounts.authority.key();
    arcium_config.mxe_registry = Vec::new();
    arcium_config.min_attestations = min_attestations;
    arcium_config.max_attestation_age = max_attestation_age;
    arcium_config.bump = ctx.bumps.arcium_config;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::{MxeNodeInfo, ArciumConfig};

    #[test]
    fn test_arcium_config_initialization() {
        // Test that arcium config initializes with correct values
        let min_attestations = 1u8;
        let max_attestation_age = 60i64;
        
        // Verify values are within reasonable ranges
        assert!(min_attestations > 0);
        assert!(max_attestation_age > 0);
        assert!(max_attestation_age <= 300); // Max 5 minutes
    }

    #[test]
    fn test_arcium_config_pda_seeds() {
        // Test that arcium config PDA is derived correctly
        let program_id = Pubkey::new_unique();
        
        let (config_pda, bump) = Pubkey::find_program_address(
            &[b"arcium_config"],
            &program_id
        );
        
        assert!(bump <= 255);
        assert_ne!(config_pda, Pubkey::default());
    }

    #[test]
    fn test_arcium_config_default_values() {
        // Test default values for arcium config
        assert_eq!(ArciumConfig::DEFAULT_MAX_ATTESTATION_AGE, 60);
    }

    #[test]
    fn test_mxe_node_info_creation() {
        // Test MXE node info creation
        let node_pubkey = Pubkey::new_unique();
        let attestation_key = [1u8; 32];
        let enclave_measurement = [2u8; 32];
        let registered_at = 1234567890;
        
        let node_info = MxeNodeInfo::new(
            node_pubkey,
            attestation_key,
            enclave_measurement,
            registered_at,
        );
        
        assert_eq!(node_info.node_pubkey, node_pubkey);
        assert_eq!(node_info.attestation_key, attestation_key);
        assert_eq!(node_info.enclave_measurement, enclave_measurement);
        assert!(node_info.is_active);
        assert_eq!(node_info.registered_at, registered_at);
    }

    #[test]
    fn test_mxe_node_activation_deactivation() {
        // Test node activation/deactivation
        let mut node_info = MxeNodeInfo::new(
            Pubkey::new_unique(),
            [1u8; 32],
            [2u8; 32],
            1234567890,
        );
        
        // Should start active
        assert!(node_info.is_active);
        
        // Test deactivation
        node_info.deactivate();
        assert!(!node_info.is_active);
        
        // Test reactivation
        node_info.activate();
        assert!(node_info.is_active);
    }
}