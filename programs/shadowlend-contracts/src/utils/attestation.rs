use anchor_lang::prelude::*;
use ed25519_dalek::{Signature, PublicKey, Verifier};

use crate::state::{MxeAttestation, ArciumConfig};
use crate::errors::LendingError;

pub fn verify_mxe_attestation(
    attestation: &MxeAttestation,
    user_pubkey: &Pubkey,
    expected_commitment: &[u8; 32],
    arcium_config: &Account<ArciumConfig>,
) -> Result<()> {
    // Find the MXE node in registry
    let mxe_node = arcium_config
        .mxe_registry
        .iter()
        .find(|node| node.node_pubkey == attestation.mxe_node && node.is_active)
        .ok_or(LendingError::InvalidMxeNode)?;
    
    // Verify attestation signature
    let message = [
        user_pubkey.as_ref(),
        expected_commitment,
        &attestation.timestamp.to_le_bytes(),
        &attestation.result_hash,
    ].concat();
    
    // Verify Ed25519 signature (using v1.0.1 API)
    let signature = Signature::from_bytes(&attestation.signature)
        .map_err(|_| LendingError::InvalidAttestation)?;
    
    let public_key = PublicKey::from_bytes(&mxe_node.attestation_key)
        .map_err(|_| LendingError::InvalidAttestation)?;
    
    public_key.verify(&message, &signature)
        .map_err(|_| LendingError::InvalidAttestation)?;
    
    // Verify enclave measurement
    require!(
        attestation.mrenclave == mxe_node.enclave_measurement,
        LendingError::InvalidEnclaveMeasurement
    );
    
    // Verify freshness
    let now = Clock::get()?.unix_timestamp;
    let age = (now - attestation.timestamp).abs();
    require!(
        age <= arcium_config.max_attestation_age,
        LendingError::AttestationTooOld
    );
    
    Ok(())
}