#!/usr/bin/env node
/**
 * Check ETH and USDC balance of a Brewit smart account
 * Usage: node check-balance.js <smart-account-address>
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RPC_ENDPOINT = 'https://mainnet.base.org';

const ERC20_ABI = [{
  inputs: [{ name: 'account', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
}];

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
  const usdcBalance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  console.log('💰 Balances:');
  console.log('   ETH:', formatUnits(ethBalance, 18), 'ETH');
  console.log('   USDC:', formatUnits(usdcBalance, 6), 'USDC');
}

main().catch(console.error);
