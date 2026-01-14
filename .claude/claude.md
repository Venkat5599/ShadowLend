# ShadowLend Development Guide

## Overview

ShadowLend is a **privacy-preserving lending protocol** on Solana using **Arcium MXE** for confidential computation. This document explains the implemented architecture and common patterns.

---

## Architecture: Hybrid Privacy Model

> [!IMPORTANT]
> ShadowLend uses a **Hybrid Privacy** model, NOT the original "Two-Phase Deposit" design.

### What's Private

| Data | Status | Why |
|------|--------|-----|
| User Balances | ✅ PRIVATE | Stored as `Enc<Shared, UserState>` |
| Health Factors | ✅ PRIVATE | Computed inside Arcium MXE |
| Pool Totals | ✅ PRIVATE | Stored as `Enc<Mxe, PoolState>` |

### What's Public

| Data | Status | Why |
|------|--------|-----|
| Transfer Amounts | PUBLIC | SPL Token compatibility |
| Liquidation Events | PUBLIC | Protocol safety |

---

## Instruction Flows

### Atomic Operations (Transfer BEFORE Computation)

**Deposit & Repay** use atomic flows:
1. Handler performs SPL transfer (User → Vault)
2. Handler queues Arcium computation with **plaintext** amount
3. Circuit updates encrypted balances
4. Callback verifies success and stores state

```rust
// deposit/handler.rs pattern
token::transfer(..., amount)?;  // Transfer FIRST
let args = ArgBuilder::new()
    .plaintext_u64(amount)       // Plaintext to circuit
    ...
```

### Revealed Operations (Computation BEFORE Transfer)

**Borrow, Withdraw, Liquidate** reveal amounts in callbacks:
1. Handler queues computation with **encrypted** amount
2. Circuit verifies HF privately, outputs `revealed_amount`
3. Callback reads revealed amount and performs SPL transfer

```rust
// borrow/callback.rs pattern
let approved = user_output.ciphertexts[4][0] != 0;
let amount = u64::from_le_bytes(user_output.ciphertexts[5][0..8]...);
token::transfer(..., amount)?;  // Transfer AFTER verification
```

---

## Circuit Output Structure

All circuits return outputs in this ciphertext layout:

| Index | Content | Type |
|-------|---------|------|
| 0-3 | `UserState` (4 u128 fields) | Encrypted |
| 4 | `approved` / `success` flag | Revealed bool |
| 5 | `revealed_amount` (if applicable) | Revealed u64 |
| 6 | `revealed_seized` (liquidate only) | Revealed u64 |

> [!CAUTION]
> Do NOT use `ciphertexts.len() - 1` to find amounts. Use explicit indices.

---

## Common Mistakes to Avoid

### ❌ Wrong: Using encrypted amount for atomic operations
```rust
// BAD - Deposit should use plaintext
.encrypted_u128(encrypted_amount)
```

### ✅ Correct: Use plaintext for atomic operations
```rust
// GOOD - Deposit uses plaintext (already transferred)
.plaintext_u64(amount)
```

### ❌ Wrong: Forgetting encrypted_pool_state
```rust
// BAD - Missing pool state for liquidity checks
let args = ArgBuilder::new()
    .encrypted_u128(user_state[0..32]...)
    .encrypted_u128(user_state[32..64]...)
    // Missing pool state!
```

### ✅ Correct: Always include pool state
```rust
// GOOD - Include pool state for all operations
let args = ArgBuilder::new()
    .encrypted_u128(user_state[0..32]...)
    .encrypted_u128(user_state[32..64]...)
    .encrypted_u128(pool_state[0..32]...)   // Pool state
    .encrypted_u128(pool_state[32..64]...)  // Pool state
```

---

## File Structure

```
shadowlend_program/
├── encrypted-ixs/src/lib.rs      # Arcium circuits
├── programs/shadowlend_program/
│   ├── src/
│   │   ├── lib.rs                # Program entry + instruction routing
│   │   ├── instructions/
│   │   │   ├── deposit/
│   │   │   │   ├── handler.rs    # Atomic: transfer → compute
│   │   │   │   ├── callback.rs   # State update only
│   │   │   │   └── accounts.rs   # Token accounts included
│   │   │   ├── borrow/
│   │   │   │   ├── handler.rs    # Compute with encrypted amount
│   │   │   │   └── callback.rs   # Reveal → transfer
│   │   │   ├── withdraw/         # Same as borrow
│   │   │   ├── repay/
│   │   │   │   ├── handler.rs    # Atomic: transfer → compute
│   │   │   │   └── callback.rs   # State update only
│   │   │   └── liquidate/
│   │   │       ├── handler.rs    # Compute with plaintext repay
│   │   │       └── callback.rs   # Reveal → dual transfer
│   │   ├── state/                # Pool, UserObligation structs
│   │   └── error.rs              # Error codes
```

---

## Testing

```bash
# Build circuits and program
anchor build

# Run with local validator
solana-test-validator --reset
anchor test --skip-local-validator
```

---

## Key Principles

1. **Token transfers happen in Solana handlers, not Arcium circuits**
2. **Atomic operations = transfer first, then compute**
3. **Revealed operations = compute first, then transfer revealed amount**
4. **Always pass encrypted pool state to circuits**
5. **Use explicit ciphertext indices, not array length**
