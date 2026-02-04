---
name: brewit-crypto
description: Perform cryptocurrency transactions using Brewit smart accounts on Base. Use when the user wants to send tokens (USDC, ETH, etc.), check crypto balances, create smart accounts, or perform batch transactions. Supports gasless transactions via account abstraction (ERC-4337). Works with ENS names (e.g., vitalik.eth).
---

# Brewit Crypto Transactions

Perform cryptocurrency operations using Brewit smart accounts with account abstraction on Base network.

## Features

- ✅ **Gasless transactions** - No ETH needed for gas fees
- ✅ **Batch transactions** - Send to multiple recipients in one transaction
- ✅ **ENS support** - Send to ENS names like vitalik.eth
- ✅ **USDC & ETH** - Support for major tokens
- ✅ **Smart accounts** - ERC-4337 account abstraction

## Prerequisites

1. **Install dependencies**:
   ```bash
   npm install brewit viem
   ```

2. **Configure `.env` file** in the project root with:
   ```
   PIMLICO_API_KEY=pim_...
   PRIVATE_KEY=0x...
   ```
   - Get a Pimlico API key at https://pimlico.io (starts with `pim_`)
   - Use an existing Ethereum private key or create a new one
   - The `.env` file is gitignored and never committed

## Quick Start

### 1. Create a Brewit Smart Account

```javascript
import { toAccount } from 'brewit/account';
import { privateKeyToAccount } from 'viem/accounts';
import { PRIVATE_KEY } from './scripts/config.js';

const signer = privateKeyToAccount(PRIVATE_KEY);

const account = await toAccount({
  chainId: 8453,                        // Base mainnet
  rpcEndpoint: 'https://mainnet.base.org',
  signer: signer,
  type: 'main',
  config: { validator: 'ownable' },
});

console.log('Smart Account:', account.address);
```

### 2. Check Balances

```javascript
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { TOKENS, ERC20_ABI } from './scripts/tokens.js';

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// ETH balance
const ethBalance = await publicClient.getBalance({
  address: account.address
});
console.log('ETH:', formatUnits(ethBalance, 18));

// Token balances (iterates all tokens in the registry)
for (const [symbol, token] of Object.entries(TOKENS)) {
  const balance = await publicClient.readContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [account.address],
  });
  console.log(`${symbol}:`, formatUnits(balance, token.decimals));
}
```

### 3. Send Tokens

```javascript
import { createAccountClient } from 'brewit';
import { encodeFunctionData, parseUnits } from 'viem';
import { PIMLICO_API_KEY } from './scripts/config.js';
import { ERC20_ABI, getToken } from './scripts/tokens.js';

const BUNDLER_URL = `https://api.pimlico.io/v2/8453/rpc?apikey=${PIMLICO_API_KEY}`;
const token = getToken('USDC'); // or 'WETH', etc.

const client = createAccountClient(account, BUNDLER_URL);

// Encode transfer
const data = encodeFunctionData({
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: ['0xRecipientAddress', parseUnits('0.1', token.decimals)],
});

// Send transaction
const tx = await client.sendTransaction({
  account: account,
  to: token.address,
  value: 0n,
  data: data,
});

console.log('TX Hash:', tx);
console.log('View:', `https://basescan.org/tx/${tx}`);
```

### 4. Batch Transactions (Multiple Recipients)

```javascript
import { ERC20_ABI, getToken } from './scripts/tokens.js';

const token = getToken('USDC');

const calls = [
  {
    to: token.address,
    value: 0n,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: ['0xRecipient1', parseUnits('0.1', token.decimals)],
    }),
  },
  {
    to: token.address,
    value: 0n,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: ['0xRecipient2', parseUnits('0.2', token.decimals)],
    }),
  },
];

// Send batch (all in one transaction!)
const tx = await client.sendTransaction({
  account: account,
  calls: calls,  // Note: 'calls' instead of 'to/value/data'
});
```

### 5. Send to ENS Names

```javascript
import { mainnet } from 'viem/chains';

// Resolve ENS name to address (on Ethereum mainnet)
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com'),
});

const address = await ensClient.getEnsAddress({ 
  name: 'vitalik.eth' 
});

// Then send to that address on Base
import { ERC20_ABI, getToken } from './scripts/tokens.js';
const token = getToken('USDC');

const data = encodeFunctionData({
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: [address, parseUnits('0.1', token.decimals)],
});

const tx = await client.sendTransaction({
  account: account,
  to: token.address,
  value: 0n,
  data: data,
});
```

## Constants

### Base Network
- **Chain ID**: 8453
- **RPC**: `https://mainnet.base.org`
- **Explorer**: https://basescan.org

### Token Addresses (Base)
Token addresses and decimals are maintained in `scripts/tokens.js`:
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (6 decimals)
- **WETH**: `0x4200000000000000000000000000000000000006` (18 decimals)

To add a new token, add an entry to the `TOKENS` object in `scripts/tokens.js`.

### Pimlico Bundler
- **URL format**: `https://api.pimlico.io/v2/{chainId}/rpc?apikey={apiKey}`
- **Base**: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_...`

## ERC20 ABI

The minimal ERC20 ABI (balanceOf, transfer) is exported from `scripts/tokens.js`:

```javascript
import { ERC20_ABI } from './scripts/tokens.js';
```

## Important Notes

### Token Decimals
- **USDC**: 6 decimals - Use `parseUnits(amount, 6)` and `formatUnits(amount, 6)`
- **ETH/WETH**: 18 decimals - Use `parseUnits(amount, 18)` and `formatUnits(amount, 18)`

### Gasless Transactions
- Brewit accounts are gasless via Pimlico bundler
- No ETH needed in the smart account for gas
- Bundler sponsors the gas fees

### Transaction Hash
- `sendTransaction()` returns the transaction hash directly
- Can be viewed on BaseScan: `https://basescan.org/tx/{hash}`

### Batch Transactions
- Use `calls: [...]` instead of `to/value/data`
- All calls execute atomically (all succeed or all fail)
- More gas-efficient than separate transactions

### Account Types
- **Main account**: Full control, can create delegated accounts
- **Delegated account**: Restricted permissions, spending limits
- Use `type: 'main'` for general purpose

## Security Best Practices

1. **Never hardcode private keys** - Use environment variables or secure storage
2. **Use test networks first** - Test on Base Sepolia before mainnet
3. **Verify recipient addresses** - Double-check before sending
4. **Start with small amounts** - Test with minimal funds first
5. **Keep API keys secure** - Don't commit to git, use .env files

## Troubleshooting

### "Insufficient balance"
- Check USDC balance is sufficient
- Remember: gasless, so no ETH needed

### "Invalid signature"
- Ensure private key matches the account signer
- Check account was created with correct signer

### ENS resolution fails
- Use Ethereum mainnet RPC for ENS (not Base)
- ENS names only resolve on Ethereum L1

### Transaction pending forever
- Check bundler URL is correct
- Verify Pimlico API key is valid
- Check Base network status

## Resources

- **Brewit Docs**: https://docs.rhinestone.wtf/overview
- **Pimlico**: https://pimlico.io
- **Base**: https://base.org
- **Viem**: https://viem.sh
- **ERC-4337**: https://eips.ethereum.org/EIPS/eip-4337
