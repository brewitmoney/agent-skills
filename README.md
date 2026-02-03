# Brewit Crypto Skill

A skill for performing cryptocurrency transactions using Brewit smart accounts with account abstraction on Base network.

## Installation

1. **Install dependencies**:
   ```bash
   npm install brewit viem
   ```

2. **Get Pimlico API key**:
   - Sign up at https://pimlico.io
   - Get your API key (starts with `pim_`)

3. **Load the skill**:
   - Copy this folder to your OpenClaw skills directory
   - The agent will automatically detect and use it when needed

## What This Skill Does

- Create Brewit smart accounts
- Send USDC and ETH (gasless!)
- Batch transactions to multiple recipients
- Check token balances
- Resolve ENS names

## Quick Start Scripts

### Create Account
```bash
node scripts/create-account.js 0xYourPrivateKey
```

### Check Balance
```bash
node scripts/check-balance.js 0xSmartAccountAddress
```

### Send USDC
```bash
node scripts/send-usdc.js 0xPrivateKey 0xRecipient 0.1 pim_YourAPIKey
```

### Batch Send
```bash
node scripts/batch-send.js 0xPrivateKey pim_APIKey 0xAddr1:0.1 0xAddr2:0.2
```

## How It Works

1. **Smart Accounts**: Uses Brewit (ERC-4337) for smart contract wallets
2. **Gasless**: Pimlico bundler sponsors gas fees
3. **Batch**: Send to multiple addresses in one transaction
4. **Base Network**: Optimized for Base L2 (low fees, fast)

## Security

- Never commit private keys to git
- Use environment variables for sensitive data
- Test on testnet first (Base Sepolia)
- Double-check recipient addresses

## Resources

- Brewit: https://docs.rhinestone.wtf
- Pimlico: https://pimlico.io
- Base: https://base.org
- Viem: https://viem.sh
