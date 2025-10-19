# Heekowave P2P Payments Platform

A decentralized peer-to-peer payments application built with MetaMask Smart Accounts, and Envio indexing on Monad testnet.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- MetaMask wallet
- Monad testnet access

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd heekowave
pnpm install

# Deploy contracts
export PRIVATE_KEY=0x...
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz
./scripts/deploy-contracts.sh

# Start development server
cd packages/frontend
pnpm dev
```

## 📁 Project Structure

```
heekowave/
├── packages/
│   ├── contracts/          # Solidity smart contracts
│   ├── frontend/          # Next.js PWA application
│   └── shared/            # Shared TypeScript types & utilities
├── scripts/               # Deployment scripts
└── DEPLOYMENT.md         # Deployment guide
```

## 🏗️ Architecture

- **Smart Contracts**: HeekowavePayments, HeekowaveWithdrawal, HeekowaveSmartAccountFactory
- **Frontend**: Next.js PWA with Serwist for offline capabilities
- **Backend**: Next.js API routes for relayer and withdrawal processing
- **Indexing**: Envio GraphQL for real-time event streaming
- **Wallet**: MetaMask Smart Accounts with delegation support

## 🔧 Development

### Smart Contracts

```bash
cd packages/contracts
forge build
forge test
```

### Frontend

```bash
cd packages/frontend
pnpm dev
```

### Shared Package

```bash
cd packages/shared
pnpm build
```

## 📱 Features

- **P2P Payments**: Send and receive USDC payments
- **Payment Requests**: Create shareable payment requests
- **Fiat Withdrawals**: Simulated off-ramp to local currencies
- **Gasless Transactions**: Via MetaMask delegation
- **Real-time Updates**: Live activity feed via Envio
- **PWA Support**: Install as mobile app
- **Push Notifications**: Payment and withdrawal alerts

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📄 License

MIT License
