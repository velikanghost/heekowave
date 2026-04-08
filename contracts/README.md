# 🦀 Heekowave Smart Contract

The core of Heekowave is a decentralized on-chain service registry built in Rust and deployed via Soroban to the Stellar Testnet.

It acts as the single source of truth for AI agents attempting to natively discover and route computing. 

## Registration Standard

The contract stores the data required for the `x402` payment negotiation protocols to function securely. 

```rust
pub struct Service {
    pub id: u64,
    pub provider: Address, // The destination wallet for all API payments
    pub name: String,
    pub endpoint: String,
    pub price: i128,       // Minimum XLM/USDC needed to clear the paywall
    pub tags: Vec<String>,
}
```

## Contract Lifecycle

1. **The Live API Directory**: Hydrates data via the local Node Gateway, visualizing the exact endpoints available on the Heekowave registry.
2. The Heekowave Gateway operates an independent `SorobanService` daemon polling the `get_all_services()` host function every 30 seconds to syndicate all available mappings.
3. The Gateway validates subsequent Agent-provided Base64 XDRs against the required `price` indexed from the `Service` mapping!

## Getting Started

To test or deploy modifications to Heekowave:

```bash
# Build the Wasm binaries
stellar contract build --optimize

# Run the unit tests locally (which perform mock auth verifications)
cargo test

# Deploy to Testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/bazaar.wasm \
  --source-account <YOUR_ACCOUNT> \
  --network testnet 
```
