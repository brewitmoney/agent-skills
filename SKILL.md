---
name: brewit-crypto
description: Perform cryptocurrency transactions using Brewit smart accounts on Base. Use when the user wants to send tokens (USDC, ETH, etc.), check crypto balances, create smart accounts, or perform batch transactions. Supports gasless transactions via account abstraction (ERC-4337). Works with ENS names (e.g., vitalik.eth).
---

# Brewit Crypto Transactions

Execute cryptocurrency operations on Base network using the scripts in `scripts/`.

## Setup

Before running any script, ensure dependencies are installed:

```bash
cd /home/koshik/.openclaw/workspace/skills/brewit && npm install
```

A `.env` file must exist in the skill root (`/home/koshik/.openclaw/workspace/skills/brewit/.env`) with:

```
PIMLICO_API_KEY=pim_...
PRIVATE_KEY=0x...
```

If the `.env` file is missing or keys are not set, ask the user to provide them before proceeding.

## Commands

All commands must be run from the skill root directory: `/home/koshik/.openclaw/workspace/skills/brewit`

### Create Smart Account

Derives the Brewit smart account address from the configured private key.

```bash
node scripts/create-account.js
```

No arguments. Outputs the smart account address. Run this first if the user doesn't know their account address.

### Check Balances

Shows ETH, USDC, USDT, and WETH balances for a given address.

```bash
node scripts/check-balance.js <address>
```

- `<address>` - The wallet or smart account address to check (0x...)

### Send Token

Sends a single token transfer to one recipient. Gasless (no ETH needed for gas).

```bash
node scripts/send-token.js <token> <recipient> <amount>
```

- `<token>` - Token symbol: `USDC`, `USDT`, or `WETH`
- `<recipient>` - Destination address (0x...)
- `<amount>` - Human-readable amount (e.g., `10` for 10 USDC, `0.05` for 0.05 WETH)

Example:

```bash
node scripts/send-token.js USDC 0x1234...abcd 10
```

### Batch Send Token

Sends a token to multiple recipients in a single atomic transaction.

```bash
node scripts/batch-send-token.js <token> <recipient1:amount1> <recipient2:amount2> ...
```

- `<token>` - Token symbol: `USDC`, `USDT`, or `WETH`
- Each recipient is formatted as `address:amount`

Example:

```bash
node scripts/batch-send-token.js USDC 0xAddr1:5 0xAddr2:10 0xAddr3:2.5
```

## Supported Tokens

| Symbol | Address | Decimals |
|--------|---------|----------|
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| USDT | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` | 6 |
| WETH | `0x4200000000000000000000000000000000000006` | 18 |

To add a new token, add an entry to the `TOKENS` object in `scripts/tokens.js`.

## ENS Names

The scripts accept raw addresses only. If the user provides an ENS name (e.g., `vitalik.eth`), resolve it first by writing and running a small inline script:

```bash
node -e "
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
const client = createPublicClient({ chain: mainnet, transport: http('https://eth.llamarpc.com') });
const addr = await client.getEnsAddress({ name: '$ENS_NAME' });
console.log(addr);
"
```

Replace `$ENS_NAME` with the actual ENS name. Then use the resolved address with the send scripts.

## Key Behaviors

- All transactions are **gasless** -- no ETH is needed in the smart account for gas fees.
- Batch calls are **atomic** -- all transfers succeed or all fail together.
- Transaction output includes a BaseScan link: `https://basescan.org/tx/{hash}`
- The smart account is deterministic -- the same private key always produces the same account address.
- Network: **Base mainnet** (chain ID 8453).

## Error Handling

| Error | Cause | Action |
|-------|-------|--------|
| `PIMLICO_API_KEY not set` | Missing `.env` key | Ask user for their Pimlico API key |
| `PRIVATE_KEY not set` | Missing `.env` key | Ask user for their private key |
| `Unknown token: X` | Unsupported token symbol | Use one of: USDC, USDT, WETH |
| `Insufficient balance` | Not enough tokens | Run check-balance to verify funds |
| ENS resolution fails | Wrong RPC or invalid name | ENS resolves on Ethereum mainnet only |
