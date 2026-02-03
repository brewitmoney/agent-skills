#!/usr/bin/env node
/**
 * Send USDC to multiple recipients in one transaction
 * Usage: node batch-send.js <private-key> <pimlico-api-key> <recipient1:amount1> <recipient2:amount2> ...
 * Example: node batch-send.js 0x... pim_... 0xAddr1:0.1 0xAddr2:0.2
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
  const [privateKey, pimlicoKey, ...recipients] = process.argv.slice(2);
  
  if (!privateKey || !pimlicoKey || recipients.length === 0) {
    console.error('Usage: node batch-send.js <private-key> <pimlico-api-key> <recipient1:amount1> <recipient2:amount2> ...');
    console.error('Example: node batch-send.js 0x... pim_... 0xAddr1:0.1 0xAddr2:0.2');
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
  console.log('\nRecipients:');

  const calls = recipients.map(item => {
    const [to, amount] = item.split(':');
    console.log(`  → ${to}: ${amount} USDC`);
    
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, parseUnits(amount, 6)],
    });

    return {
      to: USDC_ADDRESS,
      value: 0n,
      data: data,
    };
  });

  console.log(`\nSending ${calls.length} transfers in 1 transaction...`);
  const client = createAccountClient(account, bundlerUrl);
  
  const tx = await client.sendTransaction({
    account: account,
    calls: calls,
  });

  console.log('\n✅ Batch transaction sent!');
  console.log('TX Hash:', tx);
  console.log('View:', `https://basescan.org/tx/${tx}`);
}

main().catch(console.error);
