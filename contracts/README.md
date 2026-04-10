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
    pub price: i128,       // Price in stroops (1 XLM = 10,000,000 stroops)
    pub tags: Vec<String>,
}

pub struct ServiceInput {
    pub name: String,
    pub endpoint: String,
    pub price: i128,
    pub tags: Vec<String>,
}
```

## Public Methods

### `register`
Register a single service.
```bash
stellar contract invoke --id <CONTRACT_ID> --source <ACCOUNT> --network testnet -- \
  register --provider <ACCOUNT> \
  --name "Weather Service" \
  --endpoint "https://api.weather.com" \
  --price 10000000 \
  --tags '["ai", "weather"]'
```

### `batch_register`
Deploy multiple services in a single transaction (Atomic & Scalable).
```bash
stellar contract invoke --id <CONTRACT_ID> --source <ACCOUNT> --network testnet -- \
  batch_register --provider <ACCOUNT> \
  --services '[{"name": "API 1", "endpoint": "...", "price": 100, "tags": []}, {"name": "API 2", "endpoint": "...", "price": 200, "tags": []}]'
```

### `get_all_services`
Returns the complete list of registered APIs.
```bash
stellar contract invoke --id <CONTRACT_ID> --network testnet -- get_all_services
```

### `update_price`
Adjust the x402 cost requirement for a service you own.
```bash
stellar contract invoke --id <CONTRACT_ID> --source <ACCOUNT> --network testnet -- \
  update_price --provider <ACCOUNT> --id 1 --new_price 50000000
```

## Getting Started

To test or deploy modifications to Heekowave:

```bash
# Build the Wasm binaries
stellar contract build --optimize

# Run the unit tests locally
cargo test

# Deploy to Testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/heekowave.wasm \
  --source-account <YOUR_ACCOUNT> \
  --network testnet 
```
