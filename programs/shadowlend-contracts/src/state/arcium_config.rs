use anchor_lang::prelude::*;

/// Arcium configuration account for managing trusted MXE nodes
/// Stores registry of authorized nodes and attestation parameters
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

impl ArciumConfig {
    /// Calculate the space required for the ArciumConfig account
    /// Assumes a maximum of 10 MXE nodes in the registry
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        4 + (10 * MxeNodeInfo::LEN) + // mxe_registry (Vec with max 10 nodes)
        1 + // min_attestations
        8 + // max_attestation_age
        1; // bump
    
    /// Default maximum attestation age (60 seconds)
    pub const DEFAULT_MAX_ATTESTATION_AGE: i64 = 60;
    
    /// Find an active MXE node by its public key
    pub fn find_active_node(&self, node_pubkey: &Pubkey) -> Option<&MxeNodeInfo> {
        self.mxe_registry
            .iter()
            .find(|node| node.node_pubkey == *node_pubkey && node.is_active)
    }
    
    /// Check if a node is registered and active
    pub fn is_node_active(&self, node_pubkey: &Pubkey) -> bool {
        self.find_active_node(node_pubkey).is_some()
    }
}

/// Information about a trusted MXE node
/// Contains keys and measurements for attestation verification
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
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

impl MxeNodeInfo {
    /// Calculate the space required for the MxeNodeInfo struct
    pub const LEN: usize = 32 + 32 + 32 + 1 + 8; // 105 bytes
    
    /// Create a new MXE node info entry
    pub fn new(
        node_pubkey: Pubkey,
        attestation_key: [u8; 32],
        enclave_measurement: [u8; 32],
        registered_at: i64,
    ) -> Self {
        Self {
            node_pubkey,
            attestation_key,
            enclave_measurement,
            is_active: true,
            registered_at,
        }
    }
    
    /// Deactivate this node
    pub fn deactivate(&mut self) {
        self.is_active = false;
    }
    
    /// Reactivate this node
    pub fn activate(&mut self) {
        self.is_active = true;
    }
}

/// MXE attestation structure for verifying computation results
/// Contains cryptographic proof of correct execution in TEE
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
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

impl MxeAttestation {
    /// Calculate the space required for the MxeAttestation struct
    pub const LEN: usize = 32 + 64 + 32 + 8 + 32 + 1; // 169 bytes
    
    /// Create a new MXE attestation
    pub fn new(
        mxe_node: Pubkey,
        signature: [u8; 64],
        mrenclave: [u8; 32],
        timestamp: i64,
        result_hash: [u8; 32],
        computation_type: ComputationType,
    ) -> Self {
        Self {
            mxe_node,
            signature,
            mrenclave,
            timestamp,
            result_hash,
            computation_type,
        }
    }
    
    /// Check if the attestation is fresh (within max age)
    pub fn is_fresh(&self, current_time: i64, max_age: i64) -> bool {
        (current_time - self.timestamp).abs() <= max_age
    }
}

/// Types of computations that can be performed by MXE
/// Used to categorize different operations for attestation
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum ComputationType {
    /// Deposit operation - adding collateral
    Deposit,
    /// Borrow operation - taking a loan
    Borrow,
    /// Repay operation - paying back debt
    Repay,
    /// Withdraw operation - removing collateral
    Withdraw,
    /// Liquidate operation - liquidating undercollateralized position
    Liquidate,
    /// Interest accrual calculation
    InterestAccrual,
}

#[cfg(test)]
mod tests {
    use super::*;
    use anchor_lang::prelude::*;

    #[test]
    fn test_mxe_node_info_new() {
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
    fn test_mxe_node_info_activation() {
        let mut node_info = MxeNodeInfo::new(
            Pubkey::new_unique(),
            [1u8; 32],
            [2u8; 32],
            1234567890,
        );
        
        assert!(node_info.is_active);
        
        node_info.deactivate();
        assert!(!node_info.is_active);
        
        node_info.activate();
        assert!(node_info.is_active);
    }

    #[test]
    fn test_mxe_node_info_serialization() {
        let node_info = MxeNodeInfo::new(
            Pubkey::new_unique(),
            [1u8; 32],
            [2u8; 32],
            1234567890,
        );
        
        // Test serialization
        let serialized = node_info.try_to_vec().unwrap();
        assert!(!serialized.is_empty());
        
        // Test deserialization
        let deserialized: MxeNodeInfo = MxeNodeInfo::try_from_slice(&serialized).unwrap();
        assert_eq!(node_info, deserialized);
    }

    #[test]
    fn test_mxe_node_info_len() {
        let node_info = MxeNodeInfo::new(
            Pubkey::new_unique(),
            [1u8; 32],
            [2u8; 32],
            1234567890,
        );
        let serialized = node_info.try_to_vec().unwrap();
        
        // Verify the LEN constant matches actual serialized size
        assert_eq!(serialized.len(), MxeNodeInfo::LEN);
    }

    #[test]
    fn test_mxe_attestation_new() {
        let mxe_node = Pubkey::new_unique();
        let signature = [3u8; 64];
        let mrenclave = [4u8; 32];
        let timestamp = 1234567890;
        let result_hash = [5u8; 32];
        let computation_type = ComputationType::Deposit;
        
        let attestation = MxeAttestation::new(
            mxe_node,
            signature,
            mrenclave,
            timestamp,
            result_hash,
            computation_type.clone(),
        );
        
        assert_eq!(attestation.mxe_node, mxe_node);
        assert_eq!(attestation.signature, signature);
        assert_eq!(attestation.mrenclave, mrenclave);
        assert_eq!(attestation.timestamp, timestamp);
        assert_eq!(attestation.result_hash, result_hash);
        assert_eq!(attestation.computation_type, computation_type);
    }

    #[test]
    fn test_mxe_attestation_freshness() {
        let attestation = MxeAttestation::new(
            Pubkey::new_unique(),
            [3u8; 64],
            [4u8; 32],
            1234567890,
            [5u8; 32],
            ComputationType::Deposit,
        );
        
        let current_time = 1234567890 + 30; // 30 seconds later
        let max_age = 60; // 60 seconds max age
        
        // Attestation should be fresh
        assert!(attestation.is_fresh(current_time, max_age));
        
        let current_time = 1234567890 + 120; // 120 seconds later
        
        // Attestation should not be fresh
        assert!(!attestation.is_fresh(current_time, max_age));
    }

    #[test]
    fn test_mxe_attestation_serialization() {
        let attestation = MxeAttestation::new(
            Pubkey::new_unique(),
            [3u8; 64],
            [4u8; 32],
            1234567890,
            [5u8; 32],
            ComputationType::Borrow,
        );
        
        // Test serialization
        let serialized = attestation.try_to_vec().unwrap();
        assert!(!serialized.is_empty());
        
        // Test deserialization
        let deserialized: MxeAttestation = MxeAttestation::try_from_slice(&serialized).unwrap();
        assert_eq!(attestation, deserialized);
    }

    #[test]
    fn test_mxe_attestation_len() {
        let attestation = MxeAttestation::new(
            Pubkey::new_unique(),
            [3u8; 64],
            [4u8; 32],
            1234567890,
            [5u8; 32],
            ComputationType::Liquidate,
        );
        let serialized = attestation.try_to_vec().unwrap();
        
        // Verify the LEN constant matches actual serialized size
        assert_eq!(serialized.len(), MxeAttestation::LEN);
    }

    #[test]
    fn test_computation_type_serialization() {
        let computation_types = vec![
            ComputationType::Deposit,
            ComputationType::Borrow,
            ComputationType::Repay,
            ComputationType::Withdraw,
            ComputationType::Liquidate,
            ComputationType::InterestAccrual,
        ];
        
        for comp_type in computation_types {
            // Test serialization
            let serialized = comp_type.try_to_vec().unwrap();
            assert!(!serialized.is_empty());
            
            // Test deserialization
            let deserialized: ComputationType = ComputationType::try_from_slice(&serialized).unwrap();
            assert_eq!(comp_type, deserialized);
        }
    }

    #[test]
    fn test_arcium_config_find_active_node() {
        let node1 = Pubkey::new_unique();
        let node2 = Pubkey::new_unique();
        let node3 = Pubkey::new_unique();
        
        let mut config = ArciumConfig {
            authority: Pubkey::new_unique(),
            mxe_registry: vec![
                MxeNodeInfo::new(node1, [1u8; 32], [2u8; 32], 1234567890),
                {
                    let mut node = MxeNodeInfo::new(node2, [3u8; 32], [4u8; 32], 1234567890);
                    node.deactivate();
                    node
                },
                MxeNodeInfo::new(node3, [5u8; 32], [6u8; 32], 1234567890),
            ],
            min_attestations: 1,
            max_attestation_age: 60,
            bump: 255,
        };
        
        // Should find active node1
        assert!(config.find_active_node(&node1).is_some());
        assert!(config.is_node_active(&node1));
        
        // Should not find inactive node2
        assert!(config.find_active_node(&node2).is_none());
        assert!(!config.is_node_active(&node2));
        
        // Should find active node3
        assert!(config.find_active_node(&node3).is_some());
        assert!(config.is_node_active(&node3));
        
        // Should not find non-existent node
        let non_existent = Pubkey::new_unique();
        assert!(config.find_active_node(&non_existent).is_none());
        assert!(!config.is_node_active(&non_existent));
    }

    #[test]
    fn test_arcium_config_len_calculation() {
        // Verify ArciumConfig::LEN calculation is correct
        let expected_len = 8 + // discriminator
            32 + // authority
            4 + (10 * MxeNodeInfo::LEN) + // mxe_registry (Vec with max 10 nodes)
            1 + // min_attestations
            8 + // max_attestation_age
            1; // bump
        
        assert_eq!(ArciumConfig::LEN, expected_len);
    }

    #[test]
    fn test_arcium_config_constants() {
        assert_eq!(ArciumConfig::DEFAULT_MAX_ATTESTATION_AGE, 60);
    }
}