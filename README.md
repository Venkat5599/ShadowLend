# ShadowLend

**Privacy-Preserving Lending Protocol on Solana**

ShadowLend is a next-generation decentralized lending protocol that enables confidential collateralization and borrowing. Built on Solana and powered by **Arcium's Multi-Party Execution Environments (MXE)**, ShadowLend introduces a hybrid privacy model where user positions and health factors remain encrypted, while liquidity movements remain transparent and auditable.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Devnet%20Alpha-orange)

---

## 🔒 Why ShadowLend?

Traditional DeFi lending protocols expose every detail of your financial history—your total deposits, your exact debt, and your liquidation threshold. This transparency, while auditable, creates vulnerabilities:
*   **Predatory Liquidation**: Observers can precisely target positions near liquidation.
*   **Financial Surveillance**: Your entire net worth and borrowing habits are public.

**ShadowLend solves this.**

### Key Features
*   **Confidential Balances**: Your deposit and borrow amounts use `Enc<Shared, UserState>`, decryptable only by you.
*   **Private Health Factors**: Risk calculations happen securely inside Arcium TEEs. Not even the protocol developers can see your health factor.
*   **Public Liquidity**: Token transfers (SPL) remain visible on-chain for auditing, preventing "stuck funds" or hidden inflation.
*   **Trustless**: Attestations via Ed25519 signatures ensure that off-chain confidentiality does not compromise on-chain security.

---

## 🏛️ Architecture

ShadowLend utilizes a **Hybrid Privacy Architecture**:

1.  **Layer 1: User Client**: Encrypts intents (borrow request) client-side using a shared secret derived from your wallet.
2.  **Layer 2: Solana Program**: Handles asset custody and orchestration. It validates proofs but sees only encrypted blobs.
3.  **Layer 3: Arcium MXE**: A Trusted Execution Environment (TEE) that decrypts state, computes logic (e.g., Interest, Health Factor), and generates a cryptographic proof of correctness.

### Visual Architecture
For a detailed visual breakdown of the system components and data flow, please refer to the Architecture Diagram:
📂 **[docs/Architecture.excalidraw](docs/Architecture.excalidraw)**

*(See also [shadowlend_program/docs/ARCHITECTURE_MVP.excalidraw](shadowlend_program/docs/ARCHITECTURE_MVP.excalidraw) for a deep technical deep-dive)*

---

## 🛠️ Technology Stack

*   **Blockchain**: Solana (High throughput, low latency)
*   **Smart Contracts**: Anchor Framework (Rust)
*   **Confidential Compute**: Arcium Network (MXE)
*   **Client SDK**: TypeScript / Node.js
*   **Oracle**: Pyth Network (Real-time price feeds)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   Rust & Cargo
*   Solana CLI (v1.18+)
*   Anchor CLI (v0.30+)
*   Arcium CLI

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/adithya-adee/ShadowLend.git
    cd ShadowLend
    ```

2.  **Install Dependencies**
    ```bash
    # Install Program dependencies
    cd shadowlend_program
    npm install

    # Install SDK dependencies
    cd ../sdk
    npm install
    ```

3.  **Build the Program**
    ```bash
    cd ../shadowlend_program
    anchor build
    ```

### Running Localnet

To spin up a full local environment with Arcium nodes and the Solana validator:

```bash
# In shadowlend_program directory
npm run setup:all
```

This script will:
*   Start the local validator.
*   Deploy the ShadowLend program.
*   Initialize the pool and mocks (USDC/SOL mints).
*   Mock Pyth Oracle prices.

---

## 📦 SDK Usage

ShadowLend provides a powerful TypeScript SDK for integration.

```typescript
import { ShadowLendClient } from "@shadow-lend/sdk";

// Initialize with your Anchor provider
const client = new ShadowLendClient(provider);

// Initialize Key Manager (Derive shared secret)
await client.initialize();

// Perform a Confidential Borrow
const borrowAmount = new BN(500_000_000); // 0.5 SOL
await client.borrow(borrowAmount);
```

👉 **[Read the Frontend Integration Guide](sdk/docs/frontend-integration.md)**

---

## 🗺️ Roadmap

*   [x] **MVP**: Single Pool (SOL/USDC), Fixed Rates.
*   [x] **SDK**: Full TypeScript support with encryption.
*   [ ] **V2**: Dynamic Interest Rates (Utilization-based).
*   [ ] **V3**: Multi-Collateral Support.
*   [ ] **Mainnet**: Audits and Trusted Setup.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
