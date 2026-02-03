#!/usr/bin/env node
/**
 * Send USDC using Brewit smart account
 * Usage: node send-usdc.js <private-key> <recipient> <amount> <pimlico-api-key>
 * Example: node send-usdc.js 0x... 0xRecipient 0.1 pim_...
 */

import { toAccount } from 'brewit/account';
import { createAccountClient } from 'brewit';
import { privateKeyToAccount } from 'viem/accounts';
import { encodeFunctionData, parseUnits } from 'viem';

const CHAIN_ID = 8453;
const RPC_ENDPOINT = 'https://mainnet.base.org';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const ERC20_ABI = [{
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  name: 'transfer',
  outputs: [{ name: '', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function',
}];

async function main() {
  const [privateKey, recipient, amount, pimlicoKey] = process.argv.slice(2);
  
  if (!privateKey || !recipient || !amount || !pimlicoKey) {
    console.error('Usage: node send-usdc.js <private-key> <recipient> <amount> <pimlico-api-key>');
    console.error('Example: node send-usdc.js 0x... 0xRecipient 0.1 pim_...');
    process.exit(1);
  }

  const bundlerUrl = `https://api.pimlico.io/v2/${CHAIN_ID}/rpc?apikey=${pimlicoKey}`;
  const signer = privateKeyToAccount(privateKey);

  console.log('Creating Brewit account...');
  const account = await toAccount({
    chainId: CHAIN_ID,
    rpcEndpoint: RPC_ENDPOINT,
    signer: signer,
    type: 'main',
    config: { validator: 'ownable' },
  });

  console.log('From:', account.address);
  console.log('To:', recipient);
  console.log('Amount:', amount, 'USDC\n');

  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [recipient, parseUnits(amount, 6)],
  });

  console.log('Sending transaction...');
  const client = createAccountClient(account, bundlerUrl);
  
  const tx = await client.sendTransaction({
    account: account,
    to: USDC_ADDRESS,
    value: 0n,
    data: data,
  });

  console.log('\n✅ Transaction sent!');
  console.log('TX Hash:', tx);
  console.log('View:', `https://basescan.org/tx/${tx}`);
}

main().catch(console.error);
