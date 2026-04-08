# 🖥️ Heekowave Dashboard

This is the human-facing bridge for the Agentic Economy, beautifully built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, and **Shadcn UI**.

## Features

1. **The Live API Directory**: Hydrates data via the local Node Gateway, visualizing the exact endpoints available on the Soroban registry.
2. **Freighter Wallet Integration**: Deeply integrated with `@stellar/freighter-api` to enforce Testnet handshakes and execute live `TransactionBuilder` x402 payment cycles natively in the browser. 
3. **The Live API Console**: Once a developer discovers an API, they click *Integrate*, construct a testnet transaction in 1 click, and dynamically fire an `L-HTTP` protocol header against the Gateway without leaving their chair. 

## Development

First, ensure the central `pnpm install` was run at the project root for workspaces.

Start the Next.js development server:
```bash
npm run dev
# or from root
pnpm dev --filter frontend
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

> [!NOTE]
> Ensure you have the **Stellar Freighter Extension** installed and tuned to the `TESTNET` in your extension settings for the connection lifecycle to pass.
