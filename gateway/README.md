# Heekowave x402 Gateway

The Heekowave Gateway is the impenetrable paywall interceptor governing the Agentic Economy, built with **NestJS**, **Prisma**, and `@stellar/stellar-sdk`.

## Routing & Proxy Architecture

The gateway uses a human-readable, slug-based routing pattern to identify services:

`GET /proxy/:shortAddr/:serviceSlug/*`

1. **`:shortAddr`**: A 7-character identifier derived from the provider's Stellar wallet (Prefix 3 + Suffix 4). Example: Wallet `GBN...KN7H` becomes `GBNKN7H`.
2. **`:serviceSlug`**: The URL-friendly version of the service name registered on-chain.
3. **`/*`**: The gateway transparently proxies all sub-paths and query parameters to the target origin server.

## Flow & Architecture

1. **The Interceptor Loop**: Clients (Agents) attempt to request data via the proxy URL. The Gateway catches the request through `src/proxy/x402.guard.ts`.
2. **The 402 Wall**: If no `l-http` protocol header is provided, the Gateway returns an HTTP Status Code `402 (Payment Required)`. It embeds the testnet provider address and the XLM micro-price requirements.
3. **Receipt Validation**: The Gateway extracts the `hash` from the `l-http` header and verifies it via the **Stellar Network**.
   - **Compliance**: Supports `x402Version: "1.0.0"`.
   - **Double-Spend Prevention**: Every transaction hash is indexed in Postgres via Prisma. Duplicate receipts are rejected instantly.
4. **Data Fulfillment**: If valid, the Gateway pipes the response from the actual origin API back to the agent.

## Synchronization

The gateway runs a background daemon that polls the Soroban Registry every **5 seconds**.

- **Near-Instant Indexing**: New services appear in the gateway within seconds of on-chain confirmation.
- **Optimistic Recovery**: The gateway automatically matches optimistic UI deployments from the frontend with validated on-chain data.

## Local Configuration

### Setup the Database

```bash
# Apply schema and migrations
pnpm exec prisma db push
```

### Start the Proxy

```bash
pnpm start:dev
# or from root
pnpm dev
```
