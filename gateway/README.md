# Heekowave x402 Gateway

The Heekowave Gateway is the impenetrable paywall interceptor governing the Agentic Economy, built with **NestJS**, **Prisma**, and `@stellar/stellar-sdk`.

## Flow & Architecture

1. **The Interceptor Loop**: Clients (Agents) attempt to request data via `GET /proxy/:apiId`. The Gateway catches the request through `src/proxy/x402.guard.ts`.
2. **The 402 Wall**: If no `L-HTTP` protocol header is provided, the Gateway returns an HTTP Status Code `402 (Payment Required)`. It seamlessly embeds the exact testnet provider address and the XLM minimum price inside the response envelope.
3. **The Validator**: Upon resubmission with the receipt payload, the Gateway extracts the `hash` and performs an independent, direct verification via the **Horizon Network RPC Server** (`https://horizon-testnet.stellar.org`).
4. **Data Fulfillment**: Only if the required payment successfully settled into the specified beneficiary wallet does the `fetch()` pipe the response from the actual origin API endpoint back to the agent natively!

### Double-Spend Prevention

To prevent rogue agents from submitting the exact same L-HTTP Base64 receipt repeatedly across thousands of requests (Double-Spending), the gateway leverages a Prisma-powered local PostgreSQL mapping. Each verified transaction hash is stored immutably. If the exact hash makes contact with the proxy again, the gateway triggers an immediate `PAYMENT_REQUIRED` failure sequence.

## Local Configuration

### Setup the Postgres Database

You must have postgres running locally.

```bash
# Apply schema and migrations
pnpm exec prisma db push
```

### Start the Proxy

```bash
npm run start:dev
# or from root
pnpm dev --filter gateway
```

> [!CAUTION]
> The gateway defaults to binding aggressively over port `3002`. Check that there are no port collisions in your environment.
