#!/usr/bin/env node
/**
 * Check ETH and token balances of a Brewit smart account
 * Usage: node check-balance.js <smart-account-address>
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { TOKENS, ERC20_ABI } from './tokens.js';

const RPC_ENDPOINT = 'https://mainnet.base.org';

async function main() {
  const address = process.argv[2];

  if (!address) {
    console.error('Usage: node check-balance.js <smart-account-address>');
    process.exit(1);
  }

  console.log('Checking balances for:', address, '\n');

  const publicClient = createPublicClient({
    chain: base,
    transport: http(RPC_ENDPOINT),
  });

  const ethBalance = await publicClient.getBalance({ address });
  console.log('💰 Balances:');
  console.log('   ETH:', formatUnits(ethBalance, 18), 'ETH');

  for (const [symbol, token] of Object.entries(TOKENS)) {
    const balance = await publicClient.readContract({
      address: token.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    console.log(`   ${symbol}:`, formatUnits(balance, token.decimals), symbol);
  }
}

main().catch(console.error);
