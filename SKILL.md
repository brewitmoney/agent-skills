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

2. **Get Pimlico API key** (bundler for gasless transactions):
   - Sign up at https://pimlico.io
   - Get API key (starts with `pim_`)

3. **Private key**:
   - Create or use existing Ethereum private key
   - Store securely (never commit to git)

## Quick Start

### 1. Create a Brewit Smart Account

```javascript
import { toAccount } from 'brewit/account';
import { privateKeyToAccount } from 'viem/accounts';

const signer = privateKeyToAccount('0x...');

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

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// ETH balance
const ethBalance = await publicClient.getBalance({ 
  address: account.address 
});
console.log('ETH:', formatUnits(ethBalance, 18));

// USDC balance
const usdcBalance = await publicClient.readContract({
  address: USDC_ADDRESS,
  abi: [{
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }],
  functionName: 'balanceOf',
  args: [account.address],
});
console.log('USDC:', formatUnits(usdcBalance, 6));
```

### 3. Send USDC

```javascript
import { createAccountClient } from 'brewit';
import { encodeFunctionData, parseUnits } from 'viem';

const PIMLICO_API_KEY = 'pim_...';
const BUNDLER_URL = `https://api.pimlico.io/v2/8453/rpc?apikey=${PIMLICO_API_KEY}`;

const client = createAccountClient(account, BUNDLER_URL);

// Encode transfer
const data = encodeFunctionData({
  abi: [{
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  }],
  functionName: 'transfer',
  args: ['0xRecipientAddress', parseUnits('0.1', 6)], // 0.1 USDC
});

// Send transaction
const tx = await client.sendTransaction({
  account: account,
  to: USDC_ADDRESS,
  value: 0n,
  data: data,
});

console.log('TX Hash:', tx);
console.log('View:', `https://basescan.org/tx/${tx}`);
```

### 4. Batch Transactions (Multiple Recipients)

```javascript
const calls = [
  {
    to: USDC_ADDRESS,
    value: 0n,
    data: encodeFunctionData({
      abi: [/* ERC20 ABI */],
      functionName: 'transfer',
      args: ['0xRecipient1', parseUnits('0.1', 6)],
    }),
  },
  {
    to: USDC_ADDRESS,
    value: 0n,
    data: encodeFunctionData({
      abi: [/* ERC20 ABI */],
      functionName: 'transfer',
      args: ['0xRecipient2', parseUnits('0.2', 6)],
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
const data = encodeFunctionData({
  abi: [/* ERC20 ABI */],
  functionName: 'transfer',
  args: [address, parseUnits('0.1', 6)],
});

const tx = await client.sendTransaction({
  account: account,
  to: USDC_ADDRESS,
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
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **WETH**: `0x4200000000000000000000000000000000000006`

### Pimlico Bundler
- **URL format**: `https://api.pimlico.io/v2/{chainId}/rpc?apikey={apiKey}`
- **Base**: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_...`

## ERC20 ABI (Minimal)

```javascript
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
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
