# 🌊 Heekowave

> **The Decentralized API Registry & x402 Payment Gateway for the Agentic Economy**

Heekowave is a decentralized marketplace where developers can publish APIs, and autonomous AI agents can instantly pay for computing access on a per-request basis natively using the Stellar blockchain.

No subscriptions. No credit cards. No human intervention needed.

## 🌟 The Problem
AI Agents are powerful, but they hit a hard stop when encountering walled-garden APIs or premium datasets because they cannot type in a credit card to subscribe. 

## 🚀 The Protocol (x402 on Stellar)
Heekowave solves this by modernizing the `402 Payment Required` HTTP status utilizing the lightning-fast Stellar testnet.

1. **Discovery**: Developers deploy APIs, registering their pricing directly to the immutable **Heekowave Soroban Smart Contract**.
2. **Interception**: Agents who navigate to an API hit the **Heekowave Gateway**. If they lack a payment receipt, the gateway throws a `402 Payment Required` challenge, returning the exact Stellar provider destination and XLM price mapped from the contract.
3. **Execution**: The agent autonomously executes a Stellar transaction, signs an `L-HTTP` base-64 cryptographic receipt containing the transaction hash, and re-requests the data. 
4. **Fulfillment**: The Gateway decrypts the x402 receipt, natively queries the **Horizon testnet** to definitively prove the funds settled, and instantly routes the data!

---

## 🏗️ Architecture

Heekowave is structured as a powerful monorepo connecting complete Web3 infrastructure:

| Component | Stack | Description |
| --------- | ----- | ----------- |
| `contracts/` | **Rust, Soroban** | The Heekowave Smart Contract. Holds the indisputable directory mapping of Service IDs, endpoints, and XLM Prices. |
| `gateway/` | **NestJS, Prisma, PostgreSQL** | The routing proxy. Uses `@stellar/stellar-sdk` to sync down the contract data and enforce 402 paywalls natively against the Horizon network. |
| `frontend/` | **Next 15, Tailwind v4** | A polished Web App that allows humans to browse the Agentic Economy, utilizing `@stellar/freighter-api` to register services on-chain. |
| `sample-api/` | **Express/Nest** | A mock Backend and an embedded `script.ts` simulating the fully autonomous AI Agent clearing the payment flow. |

---

## 🛠️ Quickstart

To run the full end-to-end environment locally to test the Agentic Flow:

### 1. Install & Configure
```bash
corepack enable pnpm
pnpm install
```

Ensure `.env` files are configured in `gateway/` with your local Postgres.

### 2. Boot the Ecosystem
Run the ecosystem concurrently using Turborepo:
```bash
pnpm dev
```
- **Heekowave Directory**: `http://localhost:3000`
- **Gateway Proxy**: `http://localhost:3002`
- **Sample API**: `http://localhost:3001`

### 3. Test the Autonomous Agent Pipeline
To witness the agent handle the paywall negotiation, pay the provider natively in XLM, and execute the receipt submission, run the included mock agent:

```bash
cd sample-api
npx tsx script.ts
```

It will output the following live workflow:
```shell
🤖 Agent: Requesting premium data...
⚠️ Agent: 402 Payment Required. Parsing requirements...
✅ Agent: Payment successful! Hash: 1cabf806fe631528ae9995fa12db47fb99914681be1ee1853fd...
⏳ Agent: Waiting 4 seconds for Horizon to index payment...
🚀 Agent: Retrying request with receipt...
📦 Agent received data: { quote: '...', author: 'Heekowave Team' }
```

## 🏆 Hackathon Notes
**No serious mocking.** Our Smart Contracts are live on the Stellar testnet, our Freighter integrations demand actual signatures, our Prisma datastore protects against replay attacks, and our X402 Guards perform native validation directly on the Horizon network. 

We built the real deal. Welcome to the Agentic Economy.
